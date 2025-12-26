import type { ProductList } from '@/features/products/types'

export interface CartItem {
  product: ProductList
  quantity: number
  subtotal: string
}

export interface CartTotals {
  subtotal: string
  shipping: string
  tax: string
  total: string
}

export interface CartResponse {
  items: CartItem[]
  totals: CartTotals
  item_count: number
}

export interface AddToCartRequest {
  product_id: string
  quantity: number
}

export interface UpdateCartRequest {
  product_id: string
  quantity: number
}

// Keeping local types for UI optimistic updates if needed
export interface CartStateItem {
  productId: string
  name: string
  price: string
  image: string
  quantity: number
  maxStock: number
}

export interface CartState {
  items: CartStateItem[]
  isOpen: boolean
  isLoading: boolean

  // Actions
  fetchCart: () => Promise<void>
  addItem: (item: CartStateItem) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  clearFrontendCart: () => void
  setIsOpen: (isOpen: boolean) => void
}
