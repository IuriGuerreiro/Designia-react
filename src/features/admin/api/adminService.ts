import { apiRequest, API_ENDPOINTS } from '@/shared/api';
import type { PayoutsResponse, TransactionsResponse } from '@/features/admin/model';

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
  async getAllPayouts(params?: AdminPayoutsQueryParams): Promise<PayoutsResponse> {
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
  async getAllTransactions(params?: AdminTransactionsQueryParams): Promise<TransactionsResponse> {
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