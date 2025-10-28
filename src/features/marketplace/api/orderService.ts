import { apiRequest, API_ENDPOINTS } from '../../../shared/api';
import type { Order } from '@/features/marketplace/model';

const cancellableStatuses: Order['status'][] = ['pending_payment', 'payment_confirmed'];

export class OrderService {
  private static instance: OrderService;

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  async getOrders(): Promise<Order[]> {
    return apiRequest<Order[]>(API_ENDPOINTS.ORDERS);
  }

  async getSellerOrders(): Promise<Order[]> {
    // Returns orders filtered to the current seller's items
    return apiRequest<Order[]>(API_ENDPOINTS.SELLER_ORDERS);
  }

  async getOrder(orderId: string): Promise<Order> {
    return apiRequest<Order>(API_ENDPOINTS.ORDER_DETAIL(orderId));
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (!this.canCancelOrder(order)) {
      throw new Error(`Order cannot be cancelled. Current status: ${order.status}.`);
    }

    return apiRequest<Order>(API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    });
  }

  canCancelOrder(order: Order): boolean {
    return cancellableStatuses.includes(order.status);
  }

  async cancelOrderWithReason(orderId: string, reason: string): Promise<{
    success: boolean;
    message: string;
    refund_requested?: boolean;
    refund_amount?: string | null;
    stripe_refund_id?: string | null;
    order: Order | (Partial<Order> & { id: string });
  }> {
    // Use payments endpoint to handle refunds and cancellation metadata
    return apiRequest(API_ENDPOINTS.PAYMENTS_CANCEL_ORDER(orderId), {
      method: 'POST',
      body: JSON.stringify({ cancellation_reason: reason }),
    });
  }

  async updateOrderStatusValidated(orderId: string, status: Order['status']): Promise<{
    success: boolean;
    message: string;
    order: Order;
    previous_status?: string;
    new_status?: string;
  }> {
    return apiRequest(API_ENDPOINTS.UPDATE_ORDER_STATUS_VALIDATED(orderId), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateTracking(orderId: string, trackingNumber: string, shippingCarrier?: string): Promise<{
    success: boolean;
    message: string;
    order: Order;
    shipping_info?: unknown;
  }> {
    return apiRequest(`${API_ENDPOINTS.ORDERS}${orderId}/update_tracking/`, {
      method: 'PATCH',
      body: JSON.stringify({ tracking_number: trackingNumber, shipping_carrier: shippingCarrier ?? '' }),
    });
  }

  async getOrderTracking(orderId: string): Promise<{
    tracking_number?: string;
    shipping_carrier?: string;
    status: string;
    shipped_at?: string;
    delivered_at?: string;
  }> {
    const order = await this.getOrder(orderId);
    return {
      tracking_number: order.tracking_number,
      shipping_carrier: order.shipping_carrier,
      status: order.status,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
    };
  }
}

export const orderService = OrderService.getInstance();
export default orderService;
