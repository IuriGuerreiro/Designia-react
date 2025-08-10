import { apiRequest, API_ENDPOINTS } from '../config/api';

export interface PaymentProcessingRequest {
  payment_method_id: string;
  cart_data: {
    shipping_address: any;
    shipping_cost: number;
    tax_amount: number;
    discount_amount: number;
    buyer_notes: string;
  };
}

export interface PaymentProcessingResponse {
  success?: boolean;
  requires_action?: boolean;
  payment_intent?: {
    id: string;
    client_secret: string;
  };
  payment_id: string;
  order_status: string;
  order_id?: string;
  amount_paid?: string;
  error?: string;
  payment_intent_status?: string;
}

export interface PaymentStatus {
  id: string;
  payment_intent_id: string;
  amount: string;
  status: string;
  created_at: string;
  processed_at?: string;
  hold_until?: string;
  days_until_release?: number;
  order_id: string;
}

export interface RefundRequest {
  order_id: string;
  amount: string;
  reason: string;
  description?: string;
}

export const paymentService = {
  async createCheckoutSession(data: any): Promise<{ clientSecret: string }> {
    console.log('=== CREATING CHECKOUT SESSION ===');
    const response = await apiRequest(API_ENDPOINTS.CREATE_CHECKOUT_SESSION, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    console.log('Checkout session created:', response);
    return response;
  },

  /**
   * Create a PaymentIntent and return clientSecret
   */
  async createPaymentIntent(cartData: any): Promise<{}> {
    console.log('=== CREATING PAYMENT INTENT ===');
    console.log('Cart data:', cartData);
    
    const response = await apiRequest(API_ENDPOINTS.CREATE_CHECKOUT_SESSION, {
      method: 'POST',
      body: JSON.stringify({ cart_data: cartData }),
    });

    console.log('Payment intent created:', response);
    return response;
  },

  /**
   * Create order from successful PaymentIntent
   */
  async createOrderFromPaymentIntent(paymentIntentId: string, cartData: any): Promise<{ success: boolean; order_id?: string; payment_id?: string; error?: string }> {
    console.log('=== CREATING ORDER FROM PAYMENT INTENT ===');
    console.log('Payment Intent ID:', paymentIntentId);
    console.log('Cart data:', cartData);
    
    const response = await apiRequest(API_ENDPOINTS.CREATE_ORDER_FROM_INTENT, {
      method: 'POST',
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        cart_data: cartData
      }),
    });

    console.log('Order creation response:', response);
    return response;
  },

  /**
   * Process payment for an order with comprehensive validation
   */
  async processOrderPayment(data: PaymentProcessingRequest): Promise<PaymentProcessingResponse> {
    console.log('=== PROCESSING ORDER PAYMENT ===');
    console.log('Processing payment with cart data:', data.cart_data);
    
    const response = await apiRequest(API_ENDPOINTS.PROCESS_ORDER_PAYMENT, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('Payment processing response:', response);
    return response;
  },

  /**
   * Get payment status by payment ID
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    console.log('Getting payment status for:', paymentId);
    
    const response = await apiRequest(API_ENDPOINTS.PAYMENT_STATUS(paymentId), {
      method: 'GET',
    });

    return response;
  },

  /**
   * Create a Stripe Connect account for sellers
   */
  async createStripeAccount(data: { country: string }) {
    console.log('Creating Stripe account with country:', data.country);
    
    const response = await apiRequest(API_ENDPOINTS.CREATE_STRIPE_ACCOUNT, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response;
  },

  /**
   * Get Stripe account status for current user
   */
  async getStripeAccountStatus() {
    console.log('Getting Stripe account status');
    
    const response = await apiRequest(API_ENDPOINTS.STRIPE_ACCOUNT_STATUS, {
      method: 'GET',
    });

    return response;
  },

  /**
   * Get seller payout history
   */
  async getSellerPayouts() {
    console.log('Getting seller payouts');
    
    const response = await apiRequest(API_ENDPOINTS.SELLER_PAYOUTS, {
      method: 'GET',
    });

    return response;
  },

  /**
   * Request a refund for an order
   */
  async requestRefund(data: RefundRequest) {
    console.log('Requesting refund for order:', data.order_id);
    
    const response = await apiRequest(API_ENDPOINTS.REQUEST_REFUND, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response;
  }
};

export default paymentService;