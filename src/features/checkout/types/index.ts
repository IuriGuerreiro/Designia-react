// Matching backend ShippingAddressRequest
export interface ShippingAddress {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

// Matching backend CreateOrderRequestRequest
export interface CreateOrderRequest {
  shipping_address: ShippingAddress
  buyer_notes?: string
}

export interface ShippingMethod {
  id: string
  name: string
  price: number
  estimated_delivery: string
}

export interface CheckoutState {
  step: 'address' | 'shipping' | 'payment' | 'confirmation'
  shippingAddress: ShippingAddress | null
  shippingMethod: ShippingMethod | null
}
