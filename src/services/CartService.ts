import { apiRequest, API_ENDPOINTS } from '../config/api';
import { type Cart, type CartItem } from '../types/marketplace';

export class CartService {
  private static instance: CartService;

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  /**
   * Get user's cart
   */
  async getCart(): Promise<Cart> {
    console.log('=== CART SERVICE - GET CART ===');
    
    try {
      const response = await apiRequest(API_ENDPOINTS.CART);
      const result = Array.isArray(response) ? response[0] : response;
      
      console.log('Cart retrieved:', {
        id: result?.id,
        totalItems: result?.total_items || 0,
        totalAmount: result?.total_amount || 0,
        itemCount: result?.items?.length || 0
      });
      
      return result;
    } catch (error) {
      console.error('=== CART SERVICE ERROR ===');
      console.error('Error getting cart:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to view your cart.');
      }
      throw error;
    }
  }

  /**
   * Add item to cart with enhanced stock error handling
   */
  async addItem(productId: string, quantity: number = 1): Promise<CartItem> {
    console.log('=== CART SERVICE - ADD ITEM ===');
    console.log('Product ID:', productId, 'Type:', typeof productId);
    console.log('Quantity:', quantity, 'Type:', typeof quantity);
    
    const payload = { product_id: productId, quantity };
    console.log('Request payload:', JSON.stringify(payload));
    
    try {
      const result = await apiRequest(API_ENDPOINTS.CART_ADD_ITEM, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      console.log('Item added to cart:', {
        id: result?.item?.id,
        productId: result?.item?.product_id,
        quantity: result?.item?.quantity,
        totalPrice: result?.item?.total_price,
        success: result?.success
      });
      
      return result.item || result;
    } catch (error: any) {
      console.error('=== CART SERVICE ERROR ===');
      console.error('Error adding item to cart:', error);
      
      // Handle structured error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        
        switch (errorData.error) {
          case 'CART_LOCKED':
            throw new Error('Cart is locked for payment processing. Please wait or refresh the page.');
          case 'PRODUCT_UNAVAILABLE':
            throw new Error('This product is no longer available.');
          case 'OUT_OF_STOCK':
            throw new Error('This product is currently out of stock.');
          case 'INSUFFICIENT_STOCK':
            throw new Error(`Only ${errorData.available_stock} items available in stock.`);
          case 'VALIDATION_ERROR':
            throw new Error('Invalid product or quantity provided.');
          default:
            throw new Error(errorData.detail || 'Failed to add item to cart.');
        }
      }
      
      // Fallback error handling
      if (error instanceof Error && error.message.includes('423')) {
        throw new Error('Cart is locked for payment processing. Please wait or refresh the page.');
      } else if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to add items to cart.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Product not found.');
      } else if (error instanceof Error && error.message.includes('400')) {
        throw new Error('Invalid quantity or product is out of stock.');
      }
      throw error;
    }
  }

  /**
   * Update cart item quantity with enhanced stock error handling
   */
  async updateItem(itemId: number, quantity: number): Promise<CartItem> {
    console.log('=== CART SERVICE - UPDATE ITEM ===');
    console.log('Item ID:', itemId);
    console.log('New quantity:', quantity);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.CART_UPDATE_ITEM, {
        method: 'PATCH',
        body: JSON.stringify({ item_id: itemId, quantity }),
      });
      
      console.log('Item updated:', {
        id: result?.item?.id,
        quantity: result?.item?.quantity,
        totalPrice: result?.item?.total_price,
        success: result?.success
      });
      
      return result.item || result;
    } catch (error: any) {
      console.error('=== CART SERVICE ERROR ===');
      console.error('Error updating cart item:', error);
      
      // Handle structured error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        
        switch (errorData.error) {
          case 'CART_LOCKED':
            throw new Error('Cart is locked for payment processing. Please wait or refresh the page.');
          case 'PRODUCT_UNAVAILABLE':
            throw new Error('This product is no longer available.');
          case 'INSUFFICIENT_STOCK':
            throw new Error(`Only ${errorData.available_stock} items available in stock.`);
          case 'STOCK_RESERVED':
            throw new Error(`Only ${errorData.available_stock} items available (some reserved in other carts).`);
          case 'INVALID_QUANTITY':
            throw new Error('Please enter a valid quantity.');
          case 'MISSING_PARAMETERS':
            throw new Error('Missing required information for update.');
          default:
            throw new Error(errorData.detail || 'Failed to update cart item.');
        }
      }
      
      // Fallback error handling
      if (error instanceof Error && error.message.includes('423')) {
        throw new Error('Cart is locked for payment processing. Please wait or refresh the page.');
      } else if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to update cart.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Cart item not found.');
      } else if (error instanceof Error && error.message.includes('400')) {
        throw new Error('Invalid quantity or insufficient stock.');
      }
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: number): Promise<void> {
    console.log('=== CART SERVICE - REMOVE ITEM ===');
    console.log('Item ID:', itemId);
    
    try {
      await apiRequest(API_ENDPOINTS.CART_REMOVE_ITEM, {
        method: 'DELETE',
        body: JSON.stringify({ item_id: itemId }),
      });
      
      console.log('Item removed from cart');
    } catch (error) {
      console.error('=== CART SERVICE ERROR ===');
      console.error('Error removing cart item:', error);
      
      if (error instanceof Error && error.message.includes('423')) {
        throw new Error('Cart is locked for payment processing. Please wait or refresh the page.');
      } else if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to modify cart.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Cart item not found.');
      }
      throw error;
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    console.log('=== CART SERVICE - CLEAR CART ===');
    
    try {
      await apiRequest(API_ENDPOINTS.CART_CLEAR, {
        method: 'DELETE',
      });
      
      console.log('Cart cleared successfully');
    } catch (error) {
      console.error('=== CART SERVICE ERROR ===');
      console.error('Error clearing cart:', error);
      
      if (error instanceof Error && error.message.includes('423')) {
        throw new Error('Cart is locked for payment processing. Please wait or refresh the page.');
      } else if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to clear cart.');
      }
      throw error;
    }
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.total_items || 0;
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0; // Return 0 if we can't get cart count
    }
  }

  /**
   * Get cart total amount
   */
  async getCartTotal(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.total_amount || 0;
    } catch (error) {
      console.error('Error getting cart total:', error);
      return 0; // Return 0 if we can't get cart total
    }
  }

  /**
   * Validate cart items stock and get updated cart with stock information
   */
  async validateCartStock(): Promise<Cart> {
    console.log('=== CART SERVICE - VALIDATE STOCK ===');
    
    try {
      const response = await apiRequest(API_ENDPOINTS.CART_VALIDATE_STOCK, {
        method: 'POST'
      });
      
      console.log('Cart stock validation completed:', {
        id: response?.id,
        totalItems: response?.total_items || 0,
        itemCount: response?.items?.length || 0
      });
      
      return response;
    } catch (error) {
      console.error('=== CART SERVICE ERROR ===');
      console.error('Error validating cart stock:', error);
      
      // Fallback to regular cart retrieval
      return this.getCart();
    }
  }

  /**
   * Update cart item status (active/inactive) in database
   */
  async updateItemStatus(itemId: number, isActive: boolean): Promise<void> {
    console.log('=== CART SERVICE - UPDATE ITEM STATUS ===');
    console.log('Item ID:', itemId, 'Active:', isActive);
    
    try {
      await apiRequest(API_ENDPOINTS.CART_UPDATE_ITEM_STATUS, {
        method: 'PATCH',
        body: JSON.stringify({ 
          item_id: itemId, 
          is_active: isActive 
        }),
      });
      
      console.log('Item status updated successfully');
    } catch (error) {
      console.error('=== CART SERVICE ERROR ===');
      console.error('Error updating item status:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to update cart.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Cart item not found.');
      }
      throw error;
    }
  }

  /**
   * Get active cart items only (for checkout)
   */
  async getActiveCartItems(): Promise<Cart> {
    console.log('=== CART SERVICE - GET ACTIVE CART ITEMS ===');
    
    try {
      const cart = await this.getCart();
      
      // Filter only active items
      const activeItems = cart.items.filter(item => {
        // Check if item has sufficient stock and is available
        const product = item.product;
        const isInStock = product.is_in_stock && product.stock_quantity > 0;
        const hasEnoughStock = product.stock_quantity >= item.quantity;
        return isInStock && hasEnoughStock;
      });
      
      // Calculate new totals based on active items only
      const activeTotal = activeItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price.toString()) * item.quantity);
      }, 0);
      
      const activeCart: Cart = {
        ...cart,
        items: activeItems,
        total_items: activeItems.reduce((sum, item) => sum + item.quantity, 0),
        total_amount: activeTotal
      };
      
      console.log('Active cart items:', {
        totalItems: activeCart.total_items,
        totalAmount: activeCart.total_amount,
        activeItemsCount: activeItems.length,
        originalItemsCount: cart.items.length
      });
      
      return activeCart;
    } catch (error) {
      console.error('Error getting active cart items:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const cartService = CartService.getInstance();
export default cartService;