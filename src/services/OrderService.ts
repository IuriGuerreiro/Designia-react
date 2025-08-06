import { apiRequest, API_ENDPOINTS } from '../config/api';
import { type Order } from '../types/marketplace';

export class OrderService {
  private static instance: OrderService;

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  /**
   * Get user's orders
   */
  async getOrders(): Promise<Order[]> {
    console.log('=== ORDER SERVICE - GET ORDERS ===');
    
    try {
      const result = await apiRequest(API_ENDPOINTS.ORDERS);
      console.log('Orders retrieved:', {
        count: result?.length || 0,
        hasResults: !!result
      });
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error getting orders:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to view your orders.');
      }
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    console.log('=== ORDER SERVICE - GET ORDER ===');
    console.log('Order ID:', orderId);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.ORDER_DETAIL(orderId));
      console.log('Order retrieved:', {
        id: result?.id,
        status: result?.status,
        totalAmount: result?.total_amount,
        itemCount: result?.items?.length || 0
      });
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error getting order:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to view order details.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Order not found.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only view your own orders.');
      }
      throw error;
    }
  }

  /**
   * Create order from cart with comprehensive stock error handling
   */
  async createOrderFromCart(orderData: {
    shipping_address: any;
    shipping_cost?: string | number;
    tax_amount?: string | number;
    discount_amount?: string | number;
    buyer_notes?: string;
  }): Promise<{
    success: boolean;
    order?: Order;
    stockErrors?: any[];
    unavailableProducts?: any[];
    failedItems?: any[];
    partialSuccess?: boolean;
    warnings?: string[];
  }> {
    console.log('=== ORDER SERVICE - CREATE ORDER FROM CART ===');
    console.log('Order data:', orderData);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.CREATE_ORDER_FROM_CART, {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      
      console.log('Order created:', {
        id: result?.order?.id,
        status: result?.order?.status,
        totalAmount: result?.order?.total_amount,
        itemCount: result?.order?.items?.length || 0,
        success: result?.success,
        partialSuccess: result?.partial_success
      });
      
      return {
        success: result.success,
        order: result.order,
        partialSuccess: result.partial_success,
        failedItems: result.failed_items,
        warnings: result.warning ? [result.warning] : []
      };
    } catch (error: any) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error creating order:', error);
      
      // Handle structured error responses with detailed stock information
      if (error.response?.data) {
        const errorData = error.response.data;
        
        switch (errorData.error) {
          case 'STOCK_VALIDATION_FAILED':
            // Return detailed stock error information
            return {
              success: false,
              stockErrors: errorData.stock_errors || [],
              unavailableProducts: errorData.unavailable_products || [],
              warnings: [
                errorData.detail,
                errorData.action_required
              ].filter(Boolean)
            };
          case 'ORDER_PROCESSING_FAILED':
            return {
              success: false,
              failedItems: errorData.failed_items || [],
              warnings: [errorData.detail].filter(Boolean)
            };
          case 'EMPTY_CART':
            throw new Error('Your cart is empty. Please add items before proceeding to checkout.');
          case 'MISSING_ADDRESS':
            throw new Error('Shipping address is required to complete the order.');
          default:
            throw new Error(errorData.detail || 'Failed to create order.');
        }
      }
      
      // Fallback error handling
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to create orders.');
      } else if (error instanceof Error && error.message.includes('400')) {
        throw new Error('Invalid order data or empty cart.');
      } else if (error instanceof Error && error.message.includes('409')) {
        throw new Error('Some items in your cart are no longer available.');
      }
      throw error;
    }
  }

  /**
   * Cancel order (buyer only, if order is in cancellable status)
   * Orders can only be cancelled if they are in 'pending' or 'confirmed' status
   */
  async cancelOrder(orderId: string): Promise<Order> {
    console.log('=== ORDER SERVICE - CANCEL ORDER ===');
    console.log('Order ID:', orderId);
    
    try {
      // First get the order to check if it can be cancelled
      const order = await this.getOrder(orderId);
      
      // Define cancellable statuses - once an order moves beyond these, it cannot be cancelled
      const cancellableStatuses = ['pending', 'confirmed'];
      
      if (!cancellableStatuses.includes(order.status)) {
        throw new Error(`Order cannot be cancelled. Current status: ${order.status}. Orders can only be cancelled when they are 'pending' or 'confirmed'.`);
      }
      
      // Proceed with cancellation
      const result = await apiRequest(API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      
      console.log('Order cancelled:', {
        id: result?.id,
        status: result?.status
      });
      
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error cancelling order:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to cancel orders.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only cancel your own orders.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Order not found.');
      }
      throw error;
    }
  }

  /**
   * Check if an order can be cancelled
   */
  canCancelOrder(order: Order): boolean {
    const cancellableStatuses = ['pending', 'confirmed'];
    return cancellableStatuses.includes(order.status);
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId: string): Promise<{
    tracking_number?: string;
    shipping_carrier?: string;
    status: string;
    shipped_at?: string;
    delivered_at?: string;
  }> {
    try {
      const order = await this.getOrder(orderId);
      return {
        tracking_number: order.tracking_number,
        shipping_carrier: order.shipping_carrier,
        status: order.status,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
      };
    } catch (error) {
      console.error('Error getting order tracking:', error);
      throw error;
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      const orders = await this.getOrders();
      return orders.filter(order => order.status === status);
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const orderService = OrderService.getInstance();
export default orderService;