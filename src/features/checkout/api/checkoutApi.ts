import apiClient from '@/shared/api/axios'

export interface CreateOrderRequest {
  buyer_notes?: string
}

export const createOrder = async (data: CreateOrderRequest): Promise<unknown> => {
  const response = await apiClient.post('/marketplace/orders/', data)
  return response.data
}

// Create Stripe Checkout Session (Embedded)
export const createCheckoutSession = async (): Promise<{ clientSecret: string }> => {
  const response = await apiClient.post('/payments/checkout_session/')
  return response.data
}

// Retry Stripe Checkout Session
export const retryCheckoutSession = async (orderId: string): Promise<{ clientSecret: string }> => {
  const response = await apiClient.get(`/payments/checkout_session/retry/${orderId}/`)
  return response.data
}
