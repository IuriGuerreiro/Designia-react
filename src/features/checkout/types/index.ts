// Matching backend CreateOrderRequestRequest
export interface CreateOrderRequest {
  buyer_notes?: string
}

export interface CheckoutState {
  step: 'payment' | 'confirmation'
}
