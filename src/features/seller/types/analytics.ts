export interface OrdersByStatus {
  pending_payment: number
  payment_confirmed: number
  awaiting_shipment: number
  shipped: number
  delivered: number
  cancelled: number
  refunded: number
  return_requested: number
}

export interface TopProduct {
  id: string
  name: string
  slug: string
  total_sold: number
  revenue: number
  views: number
}

export interface RecentOrder {
  id: string
  buyer_username: string
  total_amount: number
  status: string
  created_at: string
  items_count: number
}

export interface SellerAnalytics {
  // Overview metrics
  total_revenue: number
  total_orders: number
  total_products: number
  active_products: number
  total_items_sold: number

  // Product metrics
  total_views: number
  total_clicks: number
  total_favorites: number

  // Conversion rates
  view_to_click_rate: number
  click_to_sale_rate: number

  // Orders breakdown
  orders_by_status: OrdersByStatus
  pending_fulfillment_count: number

  // Top products and recent orders
  top_products: TopProduct[]
  recent_orders: RecentOrder[]

  // Period info
  period_start: string | null
  period_end: string | null
}

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year' | 'all'
