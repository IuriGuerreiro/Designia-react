import apiClient from '@/shared/api/axios'
import type { PaginatedProducts, GetProductsParams, AutocompleteResult, Category } from '../types'

/**
 * Fetch a paginated list of products from the API.
 * Backend endpoint: GET /api/marketplace/products/
 */
export const getProducts = async (params?: GetProductsParams): Promise<PaginatedProducts> => {
  const response = await apiClient.get('/marketplace/products/', { params })
  return response.data
}

/**
 * Search products with filters
 * Backend endpoint: GET /api/marketplace/products/search/
 */
export const searchProducts = async (
  params: GetProductsParams & { q?: string }
): Promise<PaginatedProducts> => {
  const response = await apiClient.get('/marketplace/products/search/', { params })
  return response.data
}

/**
 * Get autocomplete suggestions
 * Backend endpoint: GET /api/marketplace/products/autocomplete/
 */
export const getAutocomplete = async (
  query: string,
  limit: number = 10
): Promise<AutocompleteResult> => {
  const response = await apiClient.get('/marketplace/products/autocomplete/', {
    params: { q: query, limit },
  })
  return response.data
}

/**
 * Fetch all active categories
 * Backend endpoint: GET /api/marketplace/products/categories/
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/marketplace/products/categories/')
  return response.data
}
