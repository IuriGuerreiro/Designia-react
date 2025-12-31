export type OrderStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'awaiting_shipment'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// If the backend /marketplace/orders/ endpoint is returning full OrderDetail objects
// then OrderListItem is effectively deprecated, and OrderListResponse.results
// should be an array of OrderDetail.
// However, to maintain some distinction for future API changes or if it truly should be a list item,
// I'll create a minimal OrderSummary for the list view.
// But the user's JSON suggests full OrderDetail objects are returned.
// Let's adjust to the user's data.

export interface OrderItem {
  id: number
  product: {
    id: string // Product UUID
    slug?: string // Product slug for direct linking
  }
  quantity: number
  unit_price: string
  total_price: string
  product_name: string // Snapshot of product name
  product_image: string // Snapshot of product image URL
}

export interface ShippingAddress {
  name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone_number?: string
}

export interface OrderDetail {
  id: string
  status: OrderStatus
  payment_status: PaymentStatus
  buyer: {
    id: string
    username: string
    first_name: string
    last_name?: string
    email: string
    avatar?: string
  } // Define if needed
  items: OrderItem[]
  subtotal: string
  shipping_cost: string
  tax_amount: string
  discount_amount: string
  total_amount: string
  shipping_address: ShippingAddress
  buyer_notes?: string
  tracking_number?: string
  shipping_carrier?: string
  shipped_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string // Added based on user's JSON
  carrier_code?: string // Added based on user's JSON
  cancellation_reason?: string // Added based on user's JSON
  cancelled_by?: string // Added based on user's JSON
  cancelled_at?: string // Added based on user's JSON
  processed_at?: string // Added based on user's JSON
}

export interface OrderListResponse {
  count: number
  page: number
  page_size: number
  num_pages: number
  results: OrderDetail[] // Changed from OrderListItem[] to OrderDetail[]
}
