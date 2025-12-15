import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import type { CartState, CartResponse, CartStateItem } from '../types'
import * as cartApi from '../api/cartApi'
import { tokenStorage } from '@/shared/utils/tokenStorage'

// Helper to transform API response to local state items
const transformCartResponse = (response: CartResponse): CartStateItem[] => {
  return response.items.map(item => ({
    productId: item.product.id,
    name: item.product.name,
    price: item.product.price,
    image: item.product.primary_image,
    quantity: item.quantity,
    maxStock: item.product.stock_quantity,
  }))
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      fetchCart: async () => {
        // Only fetch if authenticated
        if (!tokenStorage.hasTokens()) return

        set({ isLoading: true })
        try {
          const response = await cartApi.getCart()
          set({ items: transformCartResponse(response), isLoading: false })
        } catch (error) {
          console.error('Failed to fetch cart:', error)
          set({ isLoading: false })
        }
      },

      addItem: async newItem => {
        const isAuthenticated = tokenStorage.hasTokens()

        // Optimistic update
        set(state => {
          const existingItem = state.items.find(i => i.productId === newItem.productId)

          if (existingItem) {
            if (existingItem.quantity >= existingItem.maxStock) {
              toast.error(`Cannot add more. Max stock (${existingItem.maxStock}) reached.`)
              return state
            }
            return {
              items: state.items.map(i =>
                i.productId === newItem.productId ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isOpen: true,
            }
          }
          return {
            items: [...state.items, { ...newItem, quantity: 1 }],
            isOpen: true,
          }
        })

        // API call if authenticated
        if (isAuthenticated) {
          try {
            const response = await cartApi.addToCart({
              product_id: newItem.productId,
              quantity: 1,
            })
            // Sync with server response to ensure accuracy (e.g. stock limits)
            set({ items: transformCartResponse(response) })
            toast.success(`Added ${newItem.name} to cart`)
          } catch (error) {
            console.error('Failed to add to cart:', error)
            toast.error('Failed to sync with server')
            // Revert changes? For now, we rely on next fetch or user retry
            // Ideally should revert optimistic update here
            get().fetchCart()
          }
        } else {
          toast.success(`Added ${newItem.name} to cart`)
        }
      },

      removeItem: async productId => {
        const isAuthenticated = tokenStorage.hasTokens()

        // Optimistic update
        set(state => ({
          items: state.items.filter(i => i.productId !== productId),
        }))

        if (isAuthenticated) {
          try {
            const response = await cartApi.removeFromCart(productId)
            set({ items: transformCartResponse(response) })
            toast.info('Item removed from cart')
          } catch (error) {
            console.error('Failed to remove from cart:', error)
            toast.error('Failed to remove item')
            get().fetchCart()
          }
        } else {
          toast.info('Item removed from cart')
        }
      },

      updateQuantity: async (productId, quantity) => {
        const isAuthenticated = tokenStorage.hasTokens()

        // Optimistic update
        set(state => {
          if (quantity <= 0) {
            // Let logic handle 0 separately or treat as remove
            // Typically updateQuantity(0) calls removeItem
            return state
          }

          const item = state.items.find(i => i.productId === productId)
          if (item && quantity > item.maxStock) {
            toast.error(`Max stock is ${item.maxStock}`)
            return state
          }

          return {
            items: state.items.map(i => (i.productId === productId ? { ...i, quantity } : i)),
          }
        })

        if (isAuthenticated) {
          if (quantity <= 0) {
            await get().removeItem(productId)
            return
          }

          try {
            const response = await cartApi.updateCartItem({
              product_id: productId,
              quantity,
            })
            set({ items: transformCartResponse(response) })
          } catch (error) {
            console.error('Failed to update quantity:', error)
            get().fetchCart()
          }
        }
      },

      clearCart: async () => {
        const isAuthenticated = tokenStorage.hasTokens()
        set({ items: [] })

        if (isAuthenticated) {
          try {
            await cartApi.clearCart()
            toast.info('Cart cleared')
          } catch (error) {
            console.error('Failed to clear cart:', error)
          }
        } else {
          toast.info('Cart cleared')
        }
      },

      setIsOpen: isOpen => set({ isOpen }),
    }),
    {
      name: 'cart-storage',
      partialize: state => ({ items: state.items }), // Only persist items
    }
  )
)

// Selector for total items count
export const useCartCount = () =>
  useCartStore(state => state.items.reduce((acc, item) => acc + item.quantity, 0))

// Selector for subtotal
export const useCartSubtotal = () =>
  useCartStore(state =>
    state.items.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0)
  )
