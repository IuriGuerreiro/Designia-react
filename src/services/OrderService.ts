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
   * Update seller-specific tracking information (creates OrderShipping record)
   */
  async updateTracking(orderId: string, trackingNumber: string, shippingCarrier?: string): Promise<{
    success: boolean;
    message: string;
    order: Order;
    shipping_info?: any;
  }> {
    console.log('=== ORDER SERVICE - UPDATE SELLER TRACKING ===');
    console.log('Order ID:', orderId);
    console.log('Order ID Type:', typeof orderId);
    console.log('Tracking Number:', trackingNumber);
    console.log('Shipping Carrier:', shippingCarrier);
    
    const apiUrl = `${API_ENDPOINTS.ORDERS}${orderId}/update_tracking/`;
    console.log('API URL:', apiUrl);
    console.log('API_ENDPOINTS.ORDERS:', API_ENDPOINTS.ORDERS);
    
    try {
      const result = await apiRequest(apiUrl, {
        method: 'PATCH',
        body: JSON.stringify({
          tracking_number: trackingNumber,
          shipping_carrier: shippingCarrier || ''
        }),
      });
      
      console.log('Seller tracking updated:', {
        success: result?.success,
        orderId: result?.order?.id,
        status: result?.order?.status,
        hasShippingInfo: !!result?.shipping_info,
        shippingInfoId: result?.shipping_info?.id
      });
      
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error updating seller tracking:', error);
      console.error('Full error details:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to update order tracking.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only update tracking for orders containing your products.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Order not found. Please verify the order ID and try again.');
      }
      throw error;
    }
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
   * Get seller orders (orders that the current user needs to fulfill as a seller)
   */
  async getSellerOrders(statusFilter?: string): Promise<Order[]> {
    console.log('=== ORDER SERVICE - GET SELLER ORDERS ===');
    console.log('Status filter:', statusFilter);
    
    try {
      let url = `${API_ENDPOINTS.ORDERS}seller_orders/`;
      if (statusFilter && statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const result = await apiRequest(url);
      console.log('Seller orders retrieved:', {
        count: result?.length || 0,
        hasResults: !!result
      });
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error getting seller orders:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to view seller orders.');
      }
      throw error;
    }
  }

  /**
   * Cancel an order with automatic refund processing (using payment system endpoint)
   */
  async cancelOrderWithReason(orderId: string, cancellationReason: string): Promise<{
    success: boolean;
    message: string;
    refund_requested: boolean;
    refund_amount?: string;
    stripe_refund_id?: string;
    order: {
      id: string;
      status: string;
      payment_status: string;
      cancelled_at?: string;
      cancellation_reason: string;
      cancelled_by?: {
        id: number;
        username: string;
      };
    };
  }> {
    console.log('=== ORDER SERVICE - CANCEL ORDER WITH REFUND ===');
    console.log('Order ID:', orderId);
    console.log('Cancellation Reason:', cancellationReason);
    
    try {
      const result = await apiRequest(`/api/payments/orders/${orderId}/cancel/`, {
        method: 'POST',
        body: JSON.stringify({
          cancellation_reason: cancellationReason
        }),
      });
      
      console.log('Cancellation request submitted:', {
        success: result?.success,
        orderId: result?.order?.id,
        status: result?.order?.status,
        refundRequested: result?.refund_requested,
        refundAmount: result?.refund_amount
      });
      
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error cancelling order with refund:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to cancel orders.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You must be the seller of at least one item or the buyer to cancel this order.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Order not found.');
      } else if (error instanceof Error && error.message.includes('400')) {
        // Handle specific cancellation errors
        if (error.message.includes('CANNOT_CANCEL')) {
          throw new Error('Order cannot be cancelled. Orders can only be cancelled before shipping.');
        } else if (error.message.includes('MISSING_REASON')) {
          throw new Error('Cancellation reason is required.');
        } else if (error.message.includes('REFUND_FAILED')) {
          throw new Error('Order cancellation failed. Could not process refund. Please contact support.');
        }
      }
      throw error;
    }
  }

  /**
   * Process an order (move from pending to processing)
   */
  async processOrder(orderId: string): Promise<{
    success: boolean;
    message: string;
    order: Order;
  }> {
    console.log('=== ORDER SERVICE - PROCESS ORDER ===');
    console.log('Order ID:', orderId);
    
    try {
      const result = await apiRequest(`${API_ENDPOINTS.ORDERS}${orderId}/process_order/`, {
        method: 'PATCH',
      });
      
      console.log('Order processed:', {
        success: result?.success,
        orderId: result?.order?.id,
        status: result?.order?.status
      });
      
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error processing order:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to process orders.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only process your own orders.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Order not found.');
      }
      throw error;
    }
  }

  /**
   * Update carrier code for processing orders
   */
  async updateCarrierCode(orderId: string, carrierCode: string, shippingCarrier?: string): Promise<{
    success: boolean;
    message: string;
    order: Order;
  }> {
    console.log('=== ORDER SERVICE - UPDATE CARRIER CODE ===');
    console.log('Order ID:', orderId);
    console.log('Carrier Code:', carrierCode);
    console.log('Shipping Carrier:', shippingCarrier);
    
    try {
      const result = await apiRequest(`${API_ENDPOINTS.ORDERS}${orderId}/update_carrier_code/`, {
        method: 'PATCH',
        body: JSON.stringify({
          carrier_code: carrierCode,
          shipping_carrier: shippingCarrier || ''
        }),
      });
      
      console.log('Carrier code updated:', {
        success: result?.success,
        orderId: result?.order?.id,
        carrierCode: result?.order?.carrier_code
      });
      
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error updating carrier code:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to update carrier codes.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only update your own orders.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Order not found.');
      }
      throw error;
    }
  }

  /**
   * Get all tracking information for an order (multiple sellers)
   */
  async getOrderTrackingInfo(orderId: string): Promise<{
    order_id: string;
    order_status: string;
    total_sellers: number;
    tracking_information: Array<{
      seller: {
        id: number;
        username: string;
        full_name: string;
      };
      tracking_number: string;
      shipping_carrier: string;
      shipped_at?: string;
      item_count: number;
      items_total: number;
    }>;
  }> {
    console.log('=== ORDER SERVICE - GET TRACKING INFO ===');
    console.log('Order ID:', orderId);
    
    try {
      const result = await apiRequest(`${API_ENDPOINTS.ORDERS}${orderId}/tracking_info/`);
      console.log('Tracking info retrieved:', {
        orderId: result?.order_id,
        totalSellers: result?.total_sellers,
        hasTrackingData: !!result?.tracking_information?.length
      });
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error getting tracking info:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to view tracking information.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only view tracking for your orders.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Order not found.');
      }
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

  /**
   * Update order status with comprehensive validations
   * Validates payment status, ownership, and transition rules
   */
  async updateOrderStatusValidated(orderId: string, newStatus: string): Promise<{
    success: boolean;
    message: string;
    order: Order;
    previous_status: string;
    new_status: string;
  }> {
    console.log('=== ORDER SERVICE - UPDATE STATUS VALIDATED ===');
    console.log('Order ID:', orderId);
    console.log('New Status:', newStatus);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.UPDATE_ORDER_STATUS_VALIDATED(orderId), {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      
      console.log('Order status updated:', {
        success: result?.success,
        orderId: result?.order?.id,
        previousStatus: result?.previous_status,
        newStatus: result?.new_status
      });
      
      return result;
    } catch (error) {
      console.error('=== ORDER SERVICE ERROR ===');
      console.error('Error updating order status:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to update order status.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You must be the seller of at least one item in this order.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Order not found.');
      } else if (error instanceof Error && error.message.includes('400')) {
        // Parse the error message from the backend for better user experience
        throw error;
      }
      throw error;
    }
  }
}

// Export singleton instance
export const orderService = OrderService.getInstance();
export default orderService;