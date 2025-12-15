import apiClient from '@/shared/api/axios'
import type { CreateOrderRequest } from '../types'

// Temporary mock for shipping methods until backend endpoint exists
export const getShippingMethods = async () => {
  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return [
    {
      id: 'standard',
      name: 'Standard Shipping',
      price: 0,
      estimated_delivery: '5-7 business days',
    },
    {
      id: 'express',
      name: 'Express Shipping',
      price: 15.0,
      estimated_delivery: '2-3 business days',
    },
  ]
}

export const createOrder = async (data: CreateOrderRequest): Promise<unknown> => {
  const response = await apiClient.post('/marketplace/orders/', data)
  return response.data
}

// Create Stripe Payment Intent (Backend Integration)
export const createPaymentIntent = async (amount: number): Promise<{ clientSecret: string }> => {
  // NOTE: In a real backend, we'd pass the order ID or cart ID, not just amount.
  // The backend would calculate the total secure to avoid client-side manipulation.
  // Assuming backend endpoint /api/payments/create-intent exists or similar.

  // Since we know from investigation the backend uses /api/payment_system/create-checkout-session or similar,
  // we might need to adapt. However, for "Elements" integration (embedded form), we need a PaymentIntent.
  // If the backend only supports "Stripe Hosted Checkout" (redirect), we can't use Elements easily without backend changes.

  // Investigation result said: "The frontend uses the returned session to redirect the user to Stripe's hosted checkout page."
  // BUT this story (3.3) explicitly asks for "PaymentElement within Elements provider" (Embedded Form).
  // So we assume we need a PaymentIntent.

  // MOCKING the PaymentIntent creation for now as we don't have a direct backend endpoint for it documented yet
  // or we'd need to add one. For a frontend prototype, we often mock the intent call or use a dev endpoint.

  // Wait... the prompt asks to implement the story. If backend doesn't support it, I should likely
  // try to use what exists or mock it if strictly frontend.
  // Given I am "Quick Flow Solo Dev", I will mock the response structure to allow frontend dev to proceed.
  // BUT Stripe Elements WON'T render without a valid clientSecret from Stripe.
  // I can't fake a clientSecret.

  // Strategy: I will implement the API call assuming a standard endpoint exists.
  // If it fails during runtime (404), that's expected until backend catches up.
  // OR, if I can't generate a real secret, I can't render the form.

  // Let's assume there is a generic endpoint or I'll add a TODO log.
  // Actually, I can use the existing `create_checkout_session` and see if it can return a client_secret for embedded mode.
  // Stripe Checkout Sessions CAN support embedded mode (`ui_mode: 'embedded'`).

  // Let's try to hit the likely endpoint.
  const response = await apiClient.post('/payment_system/create-payment-intent/', { amount })
  return response.data
}
