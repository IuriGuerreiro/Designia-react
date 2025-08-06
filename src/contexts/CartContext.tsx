import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { cartService } from '../services';
import { type Cart } from '../types/marketplace';

interface Product {
  id: number | string;
  name: string;
  price: number | string;
  quantity: number;
  image?: string;
  imageUrl?: string;
  slug?: string;
  isActive?: boolean;
  stockError?: string;
  availableStock?: number;
  cartItemId?: number; // Server-side cart item ID for database updates
}

interface CartContextType {
  cartItems: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
  syncWithServer: () => Promise<void>;
  clearError: () => void;
  clearItemError: (productId: number | string) => Promise<void>;
  getActiveCartItems: () => Product[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated and sync cart
  useEffect(() => {
    const initializeCart = async () => {
      const token = localStorage.getItem('access_token');
      console.log('=== CART CONTEXT INITIALIZATION ===');
      console.log('Has token:', !!token);
      
      if (token) {
        setIsAuthenticated(true);
        console.log('User authenticated, syncing with server...');
        await syncWithServer();
      } else {
        setIsAuthenticated(false);
        console.log('User not authenticated, loading from localStorage...');
        loadCartFromLocalStorage();
      }
    };

    initializeCart();
  }, []);

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        const token = e.newValue;
        if (token) {
          setIsAuthenticated(true);
          syncWithServer();
        } else {
          setIsAuthenticated(false);
          loadCartFromLocalStorage();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodic cart sync to validate stock and update inactive items
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      console.log('Performing periodic cart sync for stock validation...');
      syncWithServer();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Save cart to localStorage
  const saveCartToLocalStorage = (items: Product[]) => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  };

  // Load cart from localStorage
  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart_items');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        setCartItems(items);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  };

  // Convert server cart to local format with stock validation
  const convertServerCartToLocal = (serverCart: Cart): Product[] => {
    return serverCart.items.map(item => {
      const product = item.product;
      const isInStock = product.is_in_stock && product.stock_quantity > 0;
      const hasEnoughStock = product.stock_quantity >= item.quantity;
      
      let stockError: string | undefined;
      let isActive = true;
      
      if (!isInStock) {
        stockError = 'This product is currently out of stock.';
        isActive = false;
      } else if (!hasEnoughStock) {
        stockError = `Only ${product.stock_quantity} items available in stock.`;
        isActive = false;
      }
      
      return {
        id: item.product.id,
        name: item.product.name,
        price: parseFloat(item.product.price.toString()),
        quantity: item.quantity,
        image: item.product.primary_image?.image || '/placeholder-product.png',
        imageUrl: item.product.primary_image?.image || '/placeholder-product.png',
        slug: item.product.slug,
        isActive: isActive,
        stockError: stockError,
        availableStock: isInStock ? product.stock_quantity : 0,
        cartItemId: item.id // Store server cart item ID
      };
    });
  };

  // Sync with server cart and validate stock
  const syncWithServer = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No token available, skipping server sync');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Syncing cart with server...');
      const serverCart = await cartService.getCart();
      console.log('Server cart received:', {
        id: serverCart?.id,
        totalItems: serverCart?.total_items || 0,
        itemsCount: serverCart?.items?.length || 0
      });
      
      const localItems = convertServerCartToLocal(serverCart);
      
      // Check if any items became inactive due to stock issues
      const inactiveItems = localItems.filter(item => !item.isActive);
      if (inactiveItems.length > 0) {
        console.log(`Found ${inactiveItems.length} inactive items due to stock issues`);
        
        // Update inactive items in database
        try {
          await Promise.all(
            inactiveItems.map(async (item) => {
              if (item.cartItemId) {
                console.log(`Marking cart item ${item.cartItemId} as inactive in database`);
                await cartService.updateItemStatus(item.cartItemId, false);
              }
            })
          );
          console.log('Successfully updated inactive items in database');
        } catch (error) {
          console.error('Failed to update some inactive items in database:', error);
        }
        
        // Set a general warning about stock issues
        setError(`Some items in your cart are no longer available or have limited stock.`);
      }
      
      setCartItems(localItems);
      // Also save to localStorage as backup
      saveCartToLocalStorage(localItems);
      console.log('Cart synced successfully with stock validation');
    } catch (err) {
      console.error('Failed to sync with server cart:', err);
      setError('Failed to load cart from server');
      // Fall back to localStorage if server fails
      loadCartFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    const newQuantity = product.quantity || 1;
    console.log('=== CART CONTEXT - ADD TO CART ===');
    console.log('Product:', {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: newQuantity
    });
    
    // Check if product has stock information and validate
    if (product.availableStock !== undefined && product.availableStock <= 0) {
      const error = 'This product is currently out of stock.';
      setError(error);
      throw new Error(error);
    }
    
    const existingItem = cartItems.find(item => item.id.toString() === product.id.toString());
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const totalQuantityAfterAdd = currentQuantityInCart + newQuantity;
    
    // Check if adding this quantity would exceed available stock
    if (product.availableStock !== undefined && totalQuantityAfterAdd > product.availableStock) {
      const error = `Only ${product.availableStock} items available in stock. You already have ${currentQuantityInCart} in your cart.`;
      setError(error);
      throw new Error(error);
    }
    
    // Optimistic update
    const updatedItems = cartItems.map(item => {
      if (item.id.toString() === product.id.toString()) {
        return { ...item, quantity: item.quantity + newQuantity, stockError: undefined, isActive: true };
      }
      return item;
    });
    
    if (!existingItem) {
      updatedItems.push({ 
        ...product, 
        quantity: newQuantity,
        image: product.image || product.imageUrl || '/placeholder-product.png',
        isActive: true,
        stockError: undefined
      });
    }
    
    setCartItems(updatedItems);
    saveCartToLocalStorage(updatedItems);

    // Sync with server if authenticated
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        console.log('Syncing with server - adding item...');
        await cartService.addItem(product.id.toString(), newQuantity);
        console.log('Item added to server cart successfully');
      } catch (err) {
        console.error('Failed to add to server cart:', err);
        
        // Handle stock-related errors by updating item status instead of global error
        if (err instanceof Error && (err.message.includes('stock') || err.message.includes('available'))) {
          console.log('Stock error detected, updating item status');
          const updatedItemsWithError = cartItems.map(item => {
            if (item.id.toString() === product.id.toString()) {
              return { 
                ...item, 
                isActive: false, 
                stockError: err.message,
                availableStock: extractAvailableStock(err.message)
              };
            }
            return item;
          });
          setCartItems(updatedItemsWithError);
          saveCartToLocalStorage(updatedItemsWithError);
        } else {
          // Set global error for non-stock related issues
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to add item to cart. Please try again.');
          }
          
          // Revert the optimistic update for non-stock errors
          console.log('Reverting optimistic update due to server error');
          setCartItems(cartItems);
          saveCartToLocalStorage(cartItems);
        }
        throw err; // Re-throw to let UI handle it
      }
    }
  };

  const removeFromCart = async (productId: number | string) => {
    // Optimistic update
    const updatedItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedItems);
    saveCartToLocalStorage(updatedItems);

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        // Find the cart item ID from server
        const serverCart = await cartService.getCart();
        const cartItem = serverCart.items.find(item => item.product.id === productId.toString());
        if (cartItem) {
          await cartService.removeItem(cartItem.id);
        }
      } catch (err) {
        console.error('Failed to remove from server cart:', err);
        setError('Failed to sync with server');
        // Revert optimistic update on error
        syncWithServer();
      }
    }
  };

  const updateQuantity = async (productId: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setError(null); // Clear any previous errors

    // Optimistic update - clear any previous item errors
    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity, stockError: undefined, isActive: true } : item
    );
    setCartItems(updatedItems);
    saveCartToLocalStorage(updatedItems);

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        const serverCart = await cartService.getCart();
        const cartItem = serverCart.items.find(item => item.product.id === productId.toString());
        if (cartItem) {
          await cartService.updateItem(cartItem.id, quantity);
        }
      } catch (err) {
        console.error('Failed to update server cart:', err);
        
        // Handle stock-related errors by updating item status
        if (err instanceof Error && (err.message.includes('stock') || err.message.includes('available'))) {
          console.log('Stock error detected during update, marking item as inactive');
          const updatedItemsWithError = cartItems.map(item => {
            if (item.id === productId) {
              return { 
                ...item, 
                isActive: false, 
                stockError: err.message,
                availableStock: extractAvailableStock(err.message)
              };
            }
            return item;
          });
          setCartItems(updatedItemsWithError);
          saveCartToLocalStorage(updatedItemsWithError);
        } else {
          // Set global error for non-stock related issues
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to update cart. Please try again.');
          }
          // Revert optimistic update on error
          syncWithServer();
        }
      }
    }
  };

  const clearCart = async () => {
    // Optimistic update
    setCartItems([]);
    saveCartToLocalStorage([]);

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.error('Failed to clear server cart:', err);
        setError('Failed to sync with server');
        // Revert optimistic update on error
        syncWithServer();
      }
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearItemError = async (productId: number | string) => {
    console.log('=== CLEAR ITEM ERROR ===');
    console.log('Product ID:', productId);
    
    const item = cartItems.find(item => item.id === productId);
    if (!item) {
      console.log('Item not found in cart');
      return;
    }

    console.log('Item details:', {
      id: item.id,
      name: item.name,
      currentQuantity: item.quantity,
      availableStock: item.availableStock,
      stockError: item.stockError,
      isActive: item.isActive
    });

    try {
      // If item has available stock info, adjust quantity to max available
      if (item.availableStock !== undefined && item.availableStock > 0) {
        // Always set to maximum available stock
        const adjustedQuantity = item.availableStock;
        
        console.log(`Adjusting item ${productId} quantity from ${item.quantity} to ${adjustedQuantity} (max available: ${item.availableStock})`);
        
        // Update quantity to maximum available stock
        await updateQuantity(productId, adjustedQuantity);
        
        console.log('Quantity update completed successfully');
        
      } else if (item.availableStock === 0) {
        // If no stock available, remove the item entirely
        console.log(`Removing item ${productId} - no stock available`);
        await removeFromCart(productId);
        
        console.log('Item removal completed successfully');
        
      } else {
        // Fallback: just clear the error (old behavior)
        console.log('No available stock info, just clearing error');
        const updatedItems = cartItems.map(cartItem =>
          cartItem.id === productId ? { ...cartItem, stockError: undefined, isActive: true } : cartItem
        );
        setCartItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
        
        console.log('Error cleared successfully');
      }
    } catch (error) {
      console.error('Error in clearItemError:', error);
      throw error; // Re-throw so the UI can handle it
    }
  };

  // Get only active cart items (for checkout)
  const getActiveCartItems = (): Product[] => {
    return cartItems.filter(item => item.isActive !== false);
  };

  // Helper function to extract available stock from error message
  const extractAvailableStock = (errorMessage: string): number | undefined => {
    const match = errorMessage.match(/(\d+)\s+items?\s+available/);
    return match ? parseInt(match[1], 10) : undefined;
  };

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      totalItems,
      totalAmount,
      isLoading,
      error,
      syncWithServer,
      clearError,
      clearItemError,
      getActiveCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};