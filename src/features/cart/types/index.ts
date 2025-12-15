export interface CartItem {
  productId: string
  name: string
  price: string // Store as string to match API, convert for calc
  image: string
  quantity: number
  maxStock: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setIsOpen: (isOpen: boolean) => void
}
