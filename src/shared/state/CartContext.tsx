import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartService } from '@/features/marketplace/api';
import { type Cart } from '@/features/marketplace/model';

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
  clearError: () => void;
  clearItemError: (productId: number | string) => Promise<void>;
  getActiveCartItems: () => Product[];
  // Cart locking state
  isCartLocked: boolean;
  canModifyCart: boolean;
  cartStatus: string | null;
  // Payment processing state
  isPaymentProcessing: boolean;
  setPaymentProcessing: (processing: boolean) => void;
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
  const [isCartLocked, setIsCartLocked] = useState(false);
  const [canModifyCart, setCanModifyCart] = useState(true);
  const [cartStatus, setCartStatus] = useState<string | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);


  // Hydrate cart from backend on mount (authenticated-only app)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return; // No guest carts supported
    (async () => {
      setIsLoading(true);
      try {
        const serverCart = await cartService.getCart();
        const items = convertServerCartToLocal(serverCart);
        setCartItems(items);
        setError(null);
      } catch (error) {
        console.error('Failed to load server cart:', error);
        setError('Failed to load your cart.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Helper: refresh local state from server
  const reloadCartFromServer = async () => {
    try {
      const serverCart = await cartService.getCart();
      const items = convertServerCartToLocal(serverCart);
      setCartItems(items);
    } catch (error) {
      console.error('Failed to refresh cart:', error);
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
      
      // Enhanced image URL resolution with presigned URL priority
      let imageUrl = '/placeholder-product.png';
      
      if (item.product.primary_image) {
        // Use display_url if available (from automatic assimilation)
        if (item.product.primary_image.display_url) {
          imageUrl = item.product.primary_image.display_url;
        }
        // Fallback to manual resolution if display_url not available
        else if (item.product.primary_image.presigned_url && item.product.primary_image.presigned_url !== 'null' && item.product.primary_image.presigned_url !== null) {
          imageUrl = item.product.primary_image.presigned_url;
        } else if (item.product.primary_image.image_url && item.product.primary_image.image_url !== 'null' && item.product.primary_image.image_url !== null) {
          imageUrl = item.product.primary_image.image_url;
        } else if (item.product.primary_image.image && item.product.primary_image.image !== 'null' && item.product.primary_image.image !== null) {
          imageUrl = item.product.primary_image.image;
        }
      }
      
      console.log('=== CART CONTEXT - IMAGE URL DEBUG ===');
      console.log('Product:', item.product.name);
      console.log('Primary image data:', item.product.primary_image);
      console.log('Selected imageUrl:', imageUrl);
      console.log('URL source:', item.product.primary_image?.url_source || 'manual_fallback');
      
      return {
        id: item.product.id,
        name: item.product.name,
        price: parseFloat(item.product.price.toString()),
        quantity: item.quantity,
        image: imageUrl,
        imageUrl: imageUrl,
        slug: item.product.slug,
        isActive: isActive,
        stockError: stockError,
        availableStock: isInStock ? product.stock_quantity : 0,
        cartItemId: item.id // Store server cart item ID
      };
    });
  };


  const addToCart = async (product: Product) => {
    const newQuantity = product.quantity || 1;
    // Prevent modifications when cart is locked
    if (isCartLocked || !canModifyCart) {
      const errMsg = 'Cart is locked for payment processing. Please wait or refresh the page.';
      setError(errMsg);
      throw new Error(errMsg);
    }

    // Client-side guard when stock info is known
    if (product.availableStock !== undefined && product.availableStock <= 0) {
      const errMsg = 'This product is currently out of stock.';
      setError(errMsg);
      throw new Error(errMsg);
    }

    try {
      // Always mutate server; app requires authentication
      await cartService.addItem(product.id.toString(), newQuantity);
      await reloadCartFromServer();
      setError(null);
    } catch (err) {
      console.error('Failed to add to server cart:', err);
      if (err instanceof Error) setError(err.message);
      throw err;
    }
  };


  const removeFromCart = async (productId: number | string) => {
    if (isCartLocked || !canModifyCart) {
      const errMsg = 'Cart is locked for payment processing. Please wait or refresh the page.';
      setError(errMsg);
      throw new Error(errMsg);
    }

    // Resolve server cart item id (cartItemId)
    const localItem = cartItems.find(i => i.id.toString() === productId.toString());
    const serverItemId = localItem?.cartItemId;

    try {
      if (serverItemId !== undefined) {
        await cartService.removeItem(serverItemId);
      } else {
        // Fallback: fetch server cart to resolve item ID
        const serverCart = await cartService.getCart();
        const cartItem = serverCart.items.find(item => item.product.id === productId.toString());
        if (cartItem) {
          await cartService.removeItem(cartItem.id);
        }
      }
      await reloadCartFromServer();
      setError(null);
    } catch (err) {
      console.error('Failed to remove from server cart:', err);
      setError('Failed to sync with server');
      throw err;
    }
  };


  const updateQuantity = async (productId: number | string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (isCartLocked || !canModifyCart) {
      const errMsg = 'Cart is locked for payment processing. Please wait or refresh the page.';
      setError(errMsg);
      throw new Error(errMsg);
    }

    // Local guard when available stock is known
    const targetItem = cartItems.find(item => item.id.toString() === productId.toString());
    if (targetItem && targetItem.availableStock !== undefined && quantity > targetItem.availableStock) {
      const stockErr = `Only ${targetItem.availableStock} items available in stock.`;
      // Reflect constraint locally for UX
      setCartItems(cartItems.map(item => item.id.toString() === productId.toString()
        ? { ...item, stockError: stockErr, isActive: false }
        : item
      ));
      setError(stockErr);
      throw new Error(stockErr);
    }

    try {
      // Prefer known server item id
      const serverItemId = targetItem?.cartItemId;
      if (serverItemId !== undefined) {
        await cartService.updateItem(serverItemId, quantity);
      } else {
        const serverCart = await cartService.getCart();
        const cartItem = serverCart.items.find(item => item.product.id === productId.toString());
        if (cartItem) {
          await cartService.updateItem(cartItem.id, quantity);
        }
      }
      await reloadCartFromServer();
      setError(null);
    } catch (err) {
      console.error('Failed to update server cart:', err);
      if (err instanceof Error) setError(err.message); else setError('Failed to update cart. Please try again.');
      throw err;
    }
  };


  const clearCart = async () => {
    if (isCartLocked || !canModifyCart) {
      const errMsg = 'Cart is locked for payment processing. Please wait or refresh the page.';
      setError(errMsg);
      throw new Error(errMsg);
    }
    try {
      await cartService.clearCart();
      setCartItems([]);
      setError(null);
    } catch (err) {
      console.error('Failed to clear server cart:', err);
      setError('Failed to sync with server');
      throw err;
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
        // Persist handled by server on next mutation
        
        console.log('Error cleared successfully');
      }
    } catch (error) {
      console.error('Error in clearItemError:', error);
      throw error; // Re-throw so the UI can handle it
    }
  };

  const getActiveCartItems = (): Product[] => {
    return cartItems.filter(item => item.isActive !== false);
  };

  const extractAvailableStock = (errorMessage: string): number | undefined => {
    const match = errorMessage.match(/(\d+)\s+items?\s+available/);
    return match ? parseInt(match[1], 10) : undefined;
  };

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
      clearError,
      clearItemError,
      getActiveCartItems,
      isCartLocked,
      canModifyCart,
      cartStatus,
      isPaymentProcessing,
      setPaymentProcessing: setIsPaymentProcessing
    }}>
      {children}
    </CartContext.Provider>
  );
};
