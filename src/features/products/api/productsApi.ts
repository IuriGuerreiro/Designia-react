import apiClient from '@/shared/api/axios'
import type {
  ProductListResponse,
  GetProductsParams,
  SearchProductsParams,
  AutocompleteResult,
  Category,
  ProductDetail,
} from '../types'

/**
 * Fetch a paginated list of products from the API.
 * Backend endpoint: GET /api/marketplace/products/
 */
export const getProducts = async (params?: GetProductsParams): Promise<ProductListResponse> => {
  const response = await apiClient.get('/marketplace/products/', {
    params,
    paramsSerializer: params => {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      })
      return searchParams.toString()
    },
  })
  return response.data
}

/**
 * Search products with filters
 * Backend endpoint: GET /api/marketplace/products/search/
 */
export const searchProducts = async (
  params: SearchProductsParams
): Promise<ProductListResponse> => {
  const response = await apiClient.get('/marketplace/products/search/', {
    params,
    paramsSerializer: params => {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      })
      return searchParams.toString()
    },
  })
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

/**
 * Fetch product details by Slug
 * Backend endpoint: GET /api/marketplace/products/:slug/
 */
export const getProductBySlug = async (slug: string): Promise<ProductDetail> => {
  const response = await apiClient.get(`/marketplace/products/${slug}/`)
  return response.data
}
