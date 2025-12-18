import apiClient from '@/shared/api/axios'
import type { OrderDetail, OrderListResponse } from '../types'
import type { ReturnRequestFormValues } from '../types/return' // NEW IMPORT

/**
 * Fetch a paginated list of orders for the current user.
 * Backend endpoint: GET /api/orders/
 */
export const getOrders = async (page = 1, limit = 10): Promise<OrderListResponse> => {
  const response = await apiClient.get('/marketplace/orders/', {
    params: { page, page_size: limit },
  })
  return response.data
}

/**
 * Fetch order details by ID.
 * Backend endpoint: GET /api/orders/:id/
 */
export const getOrderById = async (id: string): Promise<OrderDetail> => {
  const response = await apiClient.get(`/marketplace/orders/${id}/`)
  return response.data
}

/**
 * Create a return request for a specific order.
 * Backend endpoint: POST /api/marketplace/orders/:id/return/
 */
export const createReturnRequest = async (
  orderId: string,
  data: ReturnRequestFormValues
): Promise<unknown> => {
  // Return type can be more specific if backend provides a ReturnRequest object
  const response = await apiClient.post(`/marketplace/orders/${orderId}/return/`, data)
  return response.data
}

/**
 * Cancel an order.
 * Backend endpoint: POST /api/marketplace/orders/:id/cancel/
 */
export const cancelOrder = async (
  orderId: string,
  data: { reason: string; comment?: string }
): Promise<unknown> => {
  const response = await apiClient.post(`/marketplace/orders/${orderId}/cancel/`, data)
  return response.data
}
