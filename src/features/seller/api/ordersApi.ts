import apiClient from '@/shared/api/axios'
import type { OrderDetail, OrderListResponse } from '@/features/orders/types'

const BASE_URL = '/marketplace/orders'

export const getSellerOrders = async (
  page = 1,
  limit = 10,
  status?: string
): Promise<OrderListResponse> => {
  const response = await apiClient.get(`${BASE_URL}/seller_orders/`, {
    params: {
      page,
      page_size: limit,
      ...(status && { status }),
    },
  })
  return response.data
}

export const getSellerOrderById = async (id: string): Promise<OrderDetail> => {
  const response = await apiClient.get(`${BASE_URL}/${id}/`)
  return response.data
}

export interface FulfillmentData {
  tracking_number: string
  shipping_carrier: string
  carrier_code?: string
}

export const fulfillOrder = async (id: string, data: FulfillmentData): Promise<OrderDetail> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}/update_shipping/`, data)
  return response.data
}
