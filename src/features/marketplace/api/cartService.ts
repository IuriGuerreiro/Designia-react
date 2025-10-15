import { apiRequest, API_ENDPOINTS } from '../../../shared/api';
import type { Cart, CartItem } from '../../../types/marketplace';

const ensureCart = (response: Cart | Cart[] | null | undefined): Cart => {
  if (!response) {
    throw new Error('Unable to load cart');
  }
  return Array.isArray(response) ? response[0]! : response;
};

export class CartService {
  private static instance: CartService;
  private recountCallback?: () => void;

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  public setRecountCallback(callback: (() => void) | null): void {
    this.recountCallback = callback ?? undefined;
  }

  private triggerCartRecount(): void {
    this.recountCallback?.();
  }

  private handleError(error: unknown, fallbackMessage: string): never {
    if (error instanceof Error) {
      if (error.message.includes('423')) {
        throw new Error('Cart is locked for payment processing. Please wait or refresh the page.');
      }
      if (error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to continue.');
      }
      if (error.message.includes('404')) {
        throw new Error('The requested cart item could not be found.');
      }
      throw error;
    }

    throw new Error(fallbackMessage);
  }

  private async mutateCart<T>(
    url: string,
    init: RequestInit,
    fallbackMessage: string,
  ): Promise<T> {
    try {
      const response = await apiRequest<T>(url, init);
      this.triggerCartRecount();
      return response;
    } catch (error) {
      this.handleError(error, fallbackMessage);
      throw error instanceof Error ? error : new Error(fallbackMessage);
    }
  }

  async getCart(): Promise<Cart> {
    const response = await apiRequest<Cart | Cart[]>(API_ENDPOINTS.CART);
    return ensureCart(response);
  }

  async addItem(productId: string, quantity: number = 1): Promise<CartItem> {
    const result = await this.mutateCart<any>(
      API_ENDPOINTS.CART_ADD_ITEM,
      {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
      },
      'Failed to add the item to your cart.',
    );
    return result?.item ?? result;
  }

  async updateItem(itemId: number, quantity: number): Promise<CartItem> {
    const result = await this.mutateCart<any>(
      API_ENDPOINTS.CART_UPDATE_ITEM,
      {
        method: 'PATCH',
        body: JSON.stringify({ item_id: itemId, quantity }),
      },
      'Failed to update the selected cart item.',
    );
    return result?.item ?? result;
  }

  async removeItem(itemId: number): Promise<void> {
    await this.mutateCart(
      API_ENDPOINTS.CART_REMOVE_ITEM,
      {
        method: 'DELETE',
        body: JSON.stringify({ item_id: itemId }),
      },
      'Failed to remove the item from your cart.',
    );
  }

  async clearCart(): Promise<void> {
    await this.mutateCart(
      API_ENDPOINTS.CART_CLEAR,
      { method: 'DELETE' },
      'Failed to clear the cart.',
    );
  }

  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.total_items ?? 0;
    } catch {
      return 0;
    }
  }

  async getCartTotal(): Promise<number> {
    try {
      const cart = await this.getCart();
      return Number(cart.total_amount ?? 0);
    } catch {
      return 0;
    }
  }

  async validateCartStock(): Promise<Cart> {
    try {
      const response = await apiRequest<Cart>(API_ENDPOINTS.CART_VALIDATE_STOCK, { method: 'POST' });
      return response;
    } catch (error) {
      console.error('Error validating cart stock', error);
      return this.getCart();
    }
  }

  async updateItemStatus(itemId: number, isActive: boolean): Promise<void> {
    try {
      await apiRequest(API_ENDPOINTS.CART_UPDATE_ITEM_STATUS, {
        method: 'PATCH',
        body: JSON.stringify({ item_id: itemId, is_active: isActive }),
      });
    } catch (error) {
      this.handleError(error, 'Failed to update cart item status.');
    }
  }

  async getActiveCartItems(): Promise<Cart> {
    const cart = await this.getCart();
    const activeItems = cart.items.filter((item) => {
      const { product } = item;
      const inStock = product.is_in_stock && product.stock_quantity > 0;
      return inStock && product.stock_quantity >= item.quantity;
    });

    const totalAmount = activeItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    return {
      ...cart,
      items: activeItems,
      total_items: activeItems.reduce((sum, item) => sum + item.quantity, 0),
      total_amount: totalAmount,
    };
  }
}

export const cartService = CartService.getInstance();
export default cartService;
