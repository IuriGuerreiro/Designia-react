import apiClient from '@/shared/api/axios'
import type { Product, ProductFormData, ProductListResponse } from '../types'

const BASE_URL = '/marketplace/products' // Based on backend investigation

export const getSellerProducts = async (page = 1, limit = 10): Promise<ProductListResponse> => {
  const response = await apiClient.get(`${BASE_URL}/my_products/`, {
    params: { page, page_size: limit },
  })
  return response.data
}

export const getProduct = async (slug: string): Promise<Product> => {
  const response = await apiClient.get(`${BASE_URL}/${slug}/`)
  return response.data
}

export const createProduct = async (data: ProductFormData): Promise<Product> => {
  const response = await apiClient.post(`${BASE_URL}/`, data)
  return response.data
}

export const updateProduct = async (
  slug: string,
  data: Partial<ProductFormData>
): Promise<Product> => {
  const response = await apiClient.patch(`${BASE_URL}/${slug}/`, data)
  return response.data
}

export const deleteProduct = async (slug: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${slug}/`)
}

// Helper to upload image if needed separately, but backend supports inline base64
