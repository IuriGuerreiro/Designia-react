import { apiRequest, API_ENDPOINTS } from '../../../shared/api';

// Admin Payout Interfaces
export interface AdminPayoutSellerInfo {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface AdminPayout {
  id: string;
  stripe_payout_id: string;
  status: string;
  payout_type: string;
  amount: string;
  currency: string;
  created_at: string;
  seller_info: AdminPayoutSellerInfo;
}

export interface AdminPayoutSummary {
  total_amount: string;
  average_amount: string;
  total_fees: string;
  status_breakdown: Record<string, number>;
}

export interface AdminPayoutsResponse {
  payouts: AdminPayout[];
  pagination: {
    total_count: number;
    offset: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: AdminPayoutSummary;
}

// Admin Transaction Interfaces
export interface AdminUserInfo {
  id: string;
  username: string;
  email: string;
}

export interface AdminTransactionAmounts {
  gross_amount: string;
  platform_fee: string;
  stripe_fee: string;
  net_amount: string;
  currency: string;
}

export interface AdminTransactionHoldInfo {
  status: string;
  hold_reason: string;
  days_to_hold: number;
  hold_start_date: string | null;
  planned_release_date: string | null;
  actual_release_date: string | null;
}

export interface AdminTransactionPayoutInfo {
  payed_out: boolean;
}

export interface AdminTransactionTimestamps {
  created_at: string;
  updated_at: string;
  purchase_date: string | null;
}

export interface AdminTransaction {
  id: string;
  order_id: string | null;
  stripe_payment_intent_id: string;
  status: string;
  seller: AdminUserInfo;
  buyer: AdminUserInfo | null;
  amounts: AdminTransactionAmounts;
  hold_info: AdminTransactionHoldInfo;
  payout_info: AdminTransactionPayoutInfo;
  timestamps: AdminTransactionTimestamps;
}

export interface AdminTransactionSummary {
  total_gross: string;
  total_net: string;
  total_platform_fees: string;
  total_stripe_fees: string;
  average_transaction: string;
  status_breakdown: Record<string, number>;
}

export interface AdminTransactionsResponse {
  transactions: AdminTransaction[];
  pagination: {
    total_count: number;
    offset: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: AdminTransactionSummary;
}

// Query Parameters Interfaces
export interface AdminPayoutsQueryParams {
  status?: string;
  seller_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  page_size?: number;
  offset?: number;
}

export interface AdminTransactionsQueryParams {
  status?: string;
  seller_id?: string;
  buyer_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  page_size?: number;
  offset?: number;
}

export const adminService = {
  /**
   * Get all payouts across all sellers (admin only)
   */
  async getAllPayouts(params?: AdminPayoutsQueryParams): Promise<AdminPayoutsResponse> {
    console.log('=== GETTING ALL PAYOUTS (ADMIN) ===');
    console.log('Query params:', params);

    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.seller_id) queryParams.append('seller_id', params.seller_id);
    if (params?.from_date) queryParams.append('from_date', params.from_date);
    if (params?.to_date) queryParams.append('to_date', params.to_date);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${API_ENDPOINTS.ADMIN_PAYOUTS}?${queryParams.toString()}`;

    const response = await apiRequest(url, {
      method: 'GET',
    });

    console.log('Admin payouts response:', response);
    return response;
  },

  /**
   * Get all transactions across all sellers (admin only)
   */
  async getAllTransactions(params?: AdminTransactionsQueryParams): Promise<AdminTransactionsResponse> {
    console.log('=== GETTING ALL TRANSACTIONS (ADMIN) ===');
    console.log('Query params:', params);

    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.seller_id) queryParams.append('seller_id', params.seller_id);
    if (params?.buyer_id) queryParams.append('buyer_id', params.buyer_id);
    if (params?.from_date) queryParams.append('from_date', params.from_date);
    if (params?.to_date) queryParams.append('to_date', params.to_date);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${API_ENDPOINTS.ADMIN_TRANSACTIONS}?${queryParams.toString()}`;

    const response = await apiRequest(url, {
      method: 'GET',
    });

    console.log('Admin transactions response:', response);
    return response;
  }
};

export default adminService;