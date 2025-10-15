import { apiRequest, API_ENDPOINTS } from '../../../shared/api';

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

export interface StripeEligibilityResponse {
  eligible: boolean;
  requirements: {
    is_authenticated: boolean;
    is_oauth_user: boolean;
    has_password: boolean;
    two_factor_enabled: boolean;
    already_has_stripe_account: boolean;
  };
  errors: string[];
}

export interface StripeAccountCreationRequest {
  country: string;
  business_type: 'individual' | 'company';
}

export interface StripeAccountStatusResponse {
  has_account: boolean;
  account_id?: string;
  status?: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  requirements?: any;
  message: string;
  eligible_for_creation?: boolean;
  eligibility_errors?: string[];
}

export interface StripeAccountCreationResponse {
  account_created?: boolean;
  account_exists?: boolean;
  account_id: string;
  status: string;
  message: string;
  next_step?: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  requirements?: any;
}

export interface StripeAccountSessionResponse {
  message: string;
  client_secret: string;
  account_id: string;
}

export interface PaymentItem {
  product_name: string;
  quantity: number;
}

export interface BuyerInfo {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface PaymentAmounts {
  gross_amount: number;
  platform_fee: number;
  stripe_fee: number;
  net_amount: number;
  currency: string;
}

export interface OrderDetails {
  purchase_date: string;
  item_count: number;
  item_names: string;
  items: PaymentItem[];
}

export interface HoldStatus {
  reason: string;
  reason_display: string;
  status: string;
  status_display: string;
  total_hold_days: number;
  hold_start_date: string | null;
  planned_release_date: string | null;
  remaining_days: number;
  remaining_hours: number;
  progress_percentage: number;
  is_ready_for_release: boolean;
  hold_notes: string;
  time_display: string;
}

export interface PaymentTransaction {
  transaction_id: string;
  order_id: string;
  buyer: BuyerInfo;
  amounts: PaymentAmounts;
  order_details: OrderDetails;
  hold_status: HoldStatus;
}

export interface HoldsSummary {
  total_holds: number;
  total_pending_amount: string;
  currency: string;
  ready_for_release_count: number;
}

export interface PaymentHoldsResponse {
  success: boolean;
  summary: HoldsSummary;
  holds: PaymentTransaction[];
  message: string;
}

// Payout interfaces
export interface PayoutRequest {
  amount: number;  // Amount in cents
  currency: string;  // Currency code like 'eur', 'usd'
  description?: string;
}

export interface PayoutItem {
  id: string;
  order_id: string;
  item_names: string;
  transfer_amount: string;
  transfer_currency: string;
  transfer_date: string;
  order_total: string;
  order_date: string;
}

export interface PayoutSummary {
  id: string;
  stripe_payout_id: string;
  seller_username: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  payout_type: 'standard' | 'express' | 'instant';
  amount_decimal: string;
  formatted_amount: string;
  currency: string;
  transfer_count: number;
  bank_account_last4?: string;
  bank_name?: string;
  arrival_date?: string;
  is_completed: boolean;
  is_failed: boolean;
  days_since_created: number;
  created_at: string;
  updated_at: string;
}

export interface PayoutOrder {
  order_id: string;
  order_date: string;
  buyer_username: string;
  status: string;
  payment_status: string;
  subtotal?: string;
  shipping_cost?: string;
  tax_amount?: string;
  total_amount: string;
  transfer_amount: string;
  transfer_date: string;
  item_names?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: string;
    total: string;
  }>;
}

export interface PayoutOrdersResponse {
  payout_id: string;
  payout_amount: string;
  payout_status: string;
  transfer_count: number;
  orders: PayoutOrder[];
}

export interface PayoutTransfer {
  transaction_id: string;
  order_id: string;
  transfer_amount: string;
  transfer_currency: string;
  transfer_date: string;
  item_names: string;
}

export interface PayoutDetails {
  id: string;
  stripe_payout_id: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  payout_type: 'standard' | 'express' | 'instant';
  amount_formatted: string;
  currency: string;
  transfer_count: number;
  total_gross_amount?: string;
  total_fees?: string;
  description: string;
  created_at: string;
  arrival_date?: string;
  failure_code?: string;
  failure_message?: string;
  seller?: {
    id: string;
    username: string;
  };
}

export interface PayoutResponse {
  success: boolean;
  payout: PayoutDetails;
  message: string;
}

export interface PayoutDetailResponse {
  success: boolean;
  payout: PayoutDetails & {
    payout_items: PayoutItem[];
    seller_username: string;
    formatted_amount: string;
    is_completed: boolean;
    is_failed: boolean;
    days_since_created: number;
  };
  payment_transfers: PayoutTransfer[];
  message: string;
}

export interface PayoutListResponse {
  payouts: PayoutSummary[];
  pagination: {
    total_count: number;
    offset: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface EligibleTransfer {
  id: string;
  order_id: string;
  order_number: string;
  gross_amount: number;
  net_amount: number;
  platform_fee: number;
  stripe_fee: number;
  currency: string;
  item_names: string;
  completed_date: string;
  completed_date_formatted: string;
  transfer_id: string;
}

export interface EligibleTransfersSummary {
  transfer_count: number;
  total_gross_amount: number;
  total_fees: number;
  total_net_amount: number;
  total_amount_formatted: string;
  currency: string;
  is_eligible_for_payout: boolean;
  minimum_payout_message?: string;
}

export interface EligibleTransfersResponse {
  success: boolean;
  eligible_transfers: EligibleTransfer[];
  summary: EligibleTransfersSummary;
  seller: {
    id: string;
    username: string;
    stripe_account_id: string;
  };
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

  async createRetryCheckoutSession(orderId: string): Promise<{ clientSecret: string }> {
    console.log('=== CREATING RETRY CHECKOUT SESSION ===');
    console.log('Order ID:', orderId);
    const response = await apiRequest(API_ENDPOINTS.CREATE_RETRY_CHECKOUT_SESSION(orderId), {
        method: 'GET',
    });
    console.log('Retry checkout session created:', response);
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
  },

  /**
   * Get Stripe account info (GET) or create account if none exists (POST)
   * This unified endpoint handles both scenarios intelligently
   */
  async getStripeAccount(): Promise<StripeAccountStatusResponse> {
    console.log('=== GETTING STRIPE ACCOUNT INFO ===');
    
    const response = await apiRequest(API_ENDPOINTS.STRIPE_ACCOUNT, {
      method: 'GET',
    });

    console.log('Stripe account info response:', response);
    return response;
  },

  /**
   * Create or retrieve Stripe Connect account (unified approach)
   */
  async createStripeConnectAccount(data: StripeAccountCreationRequest): Promise<StripeAccountCreationResponse> {
    console.log('=== CREATING/RETRIEVING STRIPE CONNECT ACCOUNT ===');
    console.log('Account data:', data);
    
    const response = await apiRequest(API_ENDPOINTS.STRIPE_ACCOUNT, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('Stripe account response:', response);
    return response;
  },

  /**
   * Validate seller eligibility for Stripe account creation
   * Note: This still uses the separate validation endpoint for detailed requirements
   */
  async validateSellerEligibility(): Promise<StripeEligibilityResponse> {
    console.log('=== VALIDATING SELLER ELIGIBILITY ===');
    
    const response = await apiRequest(API_ENDPOINTS.STRIPE_VALIDATE_ELIGIBILITY, {
      method: 'GET',
    });

    console.log('Seller eligibility response:', response);
    return response;
  },

  /**
   * Create Stripe account session for onboarding
   */
  async createStripeAccountSession(): Promise<StripeAccountSessionResponse> {
    console.log('=== CREATING STRIPE ACCOUNT SESSION ===');
    
    const response = await apiRequest(API_ENDPOINTS.STRIPE_CREATE_SESSION, {
      method: 'POST',
    });

    console.log('Stripe account session response:', response);
    return response;
  },

  /**
   * Get seller payment holds with remaining time calculations
   */
  async getSellerPaymentHolds(): Promise<PaymentHoldsResponse> {
    console.log('=== GETTING SELLER PAYMENT HOLDS ===');
    
    const response = await apiRequest(API_ENDPOINTS.STRIPE_PAYMENT_HOLDS, {
      method: 'GET',
    });

    console.log('Payment holds response:', response);
    return response;
  },

  /**
   * Transfer payment to seller's connected Stripe account
   */
  async transferPaymentToSeller(data: { transaction_id: string; transfer_group?: string }): Promise<any> {
    console.log('=== TRANSFERRING PAYMENT TO SELLER ===');
    console.log('Transfer data:', data);
    
    const response = await apiRequest(API_ENDPOINTS.STRIPE_TRANSFER_PAYMENT, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('Transfer response:', response);
    return response;
  },

  /**
   * Create a payout for a seller
   */
  async createSellerPayout(data: PayoutRequest): Promise<PayoutResponse> {
    console.log('=== CREATING SELLER PAYOUT ===');
    console.log('Payout data:', data);
    
    const response = await apiRequest(API_ENDPOINTS.SELLER_PAYOUT, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('Payout creation response:', response);
    return response;
  },

  /**
   * Get payout details by ID
   */
  async getPayoutDetails(payoutId: string): Promise<PayoutDetailResponse> {
    console.log('=== GETTING PAYOUT DETAILS ===');
    console.log('Payout ID:', payoutId);
    
    const response = await apiRequest(API_ENDPOINTS.GET_PAYOUT(payoutId), {
      method: 'GET',
    });

    console.log('Payout details response:', response);
    return response;
  },

  /**
   * Get list of seller payouts
   */
  async getSellerPayoutsList(): Promise<PayoutListResponse> {
    console.log('=== GETTING SELLER PAYOUTS LIST ===');
    
    const response = await apiRequest(API_ENDPOINTS.LIST_PAYOUTS, {
      method: 'GET',
    });

    console.log('Payouts list response:', response);
    return response;
  },

  /**
   * Get eligible transfers for payout (current user only)
   */
  async getEligibleTransfers(): Promise<EligibleTransfersResponse> {
    console.log('=== GETTING ELIGIBLE TRANSFERS ===');
    
    const response = await apiRequest(API_ENDPOINTS.ELIGIBLE_TRANSFERS, {
      method: 'GET',
    });

    console.log('Eligible transfers response:', response);
    return response;
  },

  /**
   * Get user payouts list with pagination
   */
  async getUserPayouts(offset: number = 0, pageSize: number = 20): Promise<PayoutListResponse> {
    console.log('=== GETTING USER PAYOUTS ===');
    console.log('Offset:', offset, 'Page size:', pageSize);
    
    const params = new URLSearchParams({
      offset: offset.toString(),
      page_size: pageSize.toString()
    });
    
    const response = await apiRequest(`${API_ENDPOINTS.LIST_PAYOUTS}?${params}`, {
      method: 'GET',
    });

    console.log('User payouts response:', response);
    return response;
  },

  /**
   * Get detailed payout information including all items
   */
  async getPayoutDetail(payoutId: string): Promise<PayoutDetailResponse> {
    console.log('=== GETTING PAYOUT DETAIL ===');
    console.log('Payout ID:', payoutId);
    
    const response = await apiRequest(API_ENDPOINTS.PAYOUT_DETAIL(payoutId), {
      method: 'GET',
    });

    console.log('Payout detail response:', response);
    return response;
  },

  /**
   * Get all orders included in a payout
   */
  async getPayoutOrders(payoutId: string): Promise<PayoutOrdersResponse> {
    console.log('=== GETTING PAYOUT ORDERS ===');
    console.log('Payout ID:', payoutId);
    
    const response = await apiRequest(API_ENDPOINTS.PAYOUT_ORDERS(payoutId), {
      method: 'GET',
    });

    console.log('Payout orders response:', response);
    return response;
  }
};

export default paymentService;