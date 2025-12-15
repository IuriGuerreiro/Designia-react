import apiClient from '@/shared/api/axios'
import type { CartResponse, AddToCartRequest, UpdateCartRequest } from '../types'

/**
 * Get user's shopping cart
 * Backend endpoint: GET /api/marketplace/cart/
 */
export const getCart = async (): Promise<CartResponse> => {
  const response = await apiClient.get('/marketplace/cart/')
  return response.data
}

/**
 * Add item to cart
 * Backend endpoint: POST /api/marketplace/cart/add_item/
 */
export const addToCart = async (data: AddToCartRequest): Promise<CartResponse> => {
  const response = await apiClient.post('/marketplace/cart/add_item/', data)
  return response.data
}

/**
 * Remove item from cart
 * Backend endpoint: DELETE /api/marketplace/cart/remove_item/
 */
export const removeFromCart = async (productId: string): Promise<CartResponse> => {
  const response = await apiClient.delete('/marketplace/cart/remove_item/', {
    data: { product_id: productId },
  })
  return response.data
}

/**
 * Update item quantity in cart
 * Backend endpoint: PATCH /api/marketplace/cart/update_item/
 */
export const updateCartItem = async (data: UpdateCartRequest): Promise<CartResponse> => {
  const response = await apiClient.patch('/marketplace/cart/update_item/', data)
  return response.data
}

/**
 * Clear all items from cart
 * Backend endpoint: DELETE /api/marketplace/cart/clear/
 */
export const clearCart = async (): Promise<void> => {
  await apiClient.delete('/marketplace/cart/clear/')
}
