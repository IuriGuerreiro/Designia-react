import apiClient from '@/shared/api/axios'
import type { Review, CreateReviewPayload, ReviewListResponse } from '../types'

/**
 * Fetch reviews for a specific product
 * Backend endpoint: GET /api/marketplace/products/{slug}/reviews/
 */
export const getProductReviews = async (
  productSlug: string,
  params?: { page?: number; page_size?: number; ordering?: string }
): Promise<ReviewListResponse> => {
  const response = await apiClient.get(`/marketplace/products/${productSlug}/reviews/`, { params })
  return response.data
}

/**
 * Create a review for a product
 * Backend endpoint: POST /api/marketplace/products/{slug}/reviews/
 */
export const createReview = async (
  productSlug: string,
  payload: CreateReviewPayload
): Promise<Review> => {
  const response = await apiClient.post(`/marketplace/products/${productSlug}/reviews/`, payload)
  return response.data
}

/**
 * Update an existing review
 * Backend endpoint: PATCH /api/marketplace/reviews/{id}/
 */
export const updateReview = async (
  reviewId: number,
  payload: Partial<CreateReviewPayload>
): Promise<Review> => {
  const response = await apiClient.patch(`/marketplace/reviews/${reviewId}/`, payload)
  return response.data
}

/**
 * Delete a review
 * Backend endpoint: DELETE /api/marketplace/reviews/{id}/
 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(`/marketplace/reviews/${reviewId}/`)
}

/**
 * Mark a review as helpful
 * Backend endpoint: POST /api/marketplace/reviews/{id}/mark_helpful/
 */
export const markReviewHelpful = async (
  reviewId: number
): Promise<{ helpful_count: number; voted: boolean }> => {
  const response = await apiClient.post(`/marketplace/reviews/${reviewId}/mark_helpful/`)
  return response.data
}
