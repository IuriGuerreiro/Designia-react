import { apiRequest, API_ENDPOINTS } from '../config/api';

// Use relative URLs in development (Vite proxy) or full URL in production
const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://192.168.3.2:8001');
import { type ProductReview } from '../types/marketplace';

export class ReviewService {
  private static instance: ReviewService;

  public static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  /**
   * Get reviews for a product
   */
  async getProductReviews(productSlug: string): Promise<ProductReview[]> {
    console.log('=== REVIEW SERVICE - GET PRODUCT REVIEWS ===');
    console.log('Product slug:', productSlug);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.PRODUCT_REVIEWS(productSlug));
      console.log('Reviews retrieved:', {
        count: result?.length || 0,
        hasResults: !!result
      });
      return result;
    } catch (error) {
      console.error('=== REVIEW SERVICE ERROR ===');
      console.error('Error getting product reviews:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        // Product not found, return empty reviews
        return [];
      }
      throw error;
    }
  }

  /**
   * Create a new review for a product
   */
  async createReview(productSlug: string, reviewData: {
    rating: number;
    title: string;
    comment: string;
    images?: File[];
  }): Promise<ProductReview> {
    console.log('=== REVIEW SERVICE - CREATE REVIEW ===');
    console.log('Product slug:', productSlug);
    console.log('Review data:', { 
      rating: reviewData.rating, 
      title: reviewData.title,
      commentLength: reviewData.comment.length,
      imageCount: reviewData.images?.length || 0
    });
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('product_slug', productSlug);
      formData.append('rating', reviewData.rating.toString());
      formData.append('title', reviewData.title);
      formData.append('comment', reviewData.comment);
      
      // Add image files if provided
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((file, index) => {
          formData.append(`images`, file);
        });
      }

      const result = await apiRequest(API_ENDPOINTS.PRODUCT_ADD_REVIEW(productSlug), {
        method: 'POST',
        body: formData,
        // Don't set Content-Type, let browser set it for FormData
        headers: {
          // Remove Content-Type to let browser set it with boundary
        }
      });
      
      console.log('Review created:', {
        id: result?.id,
        rating: result?.rating,
        isVerified: result?.is_verified_purchase
      });
      
      return result;
    } catch (error) {
      console.error('=== REVIEW SERVICE ERROR ===');
      console.error('Error creating review:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to leave a review.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You may not be able to review this product.');
      } else if (error instanceof Error && error.message.includes('400')) {
        throw new Error('Invalid review data. Please check your input and try again.');
      } else if (error instanceof Error && error.message.includes('409')) {
        throw new Error('You have already reviewed this product.');
      }
      throw error;
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(productSlug: string, reviewId: number, reviewData: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: File[];
  }): Promise<ProductReview> {
    console.log('=== REVIEW SERVICE - UPDATE REVIEW ===');
    console.log('Review ID:', reviewId);
    
    try {
      const formData = new FormData();
      
      if (reviewData.rating !== undefined) {
        formData.append('rating', reviewData.rating.toString());
      }
      if (reviewData.title !== undefined) {
        formData.append('title', reviewData.title);
      }
      if (reviewData.comment !== undefined) {
        formData.append('comment', reviewData.comment);
      }
      
      // Add new image files if provided
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const result = await apiRequest(API_ENDPOINTS.PRODUCT_REVIEW_DETAIL(productSlug, reviewId), {
        method: 'PATCH',
        body: formData,
      });
      
      console.log('Review updated:', {
        id: result?.id,
        rating: result?.rating
      });
      
      return result;
    } catch (error) {
      console.error('=== REVIEW SERVICE ERROR ===');
      console.error('Error updating review:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to update your review.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only update your own reviews.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Review not found.');
      }
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(productSlug: string, reviewId: number): Promise<void> {
    console.log('=== REVIEW SERVICE - DELETE REVIEW ===');
    console.log('Review ID:', reviewId);
    
    try {
      await apiRequest(API_ENDPOINTS.PRODUCT_REVIEW_DETAIL(productSlug, reviewId), {
        method: 'DELETE',
      });
      
      console.log('Review deleted successfully');
    } catch (error) {
      console.error('=== REVIEW SERVICE ERROR ===');
      console.error('Error deleting review:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to delete your review.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only delete your own reviews.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Review not found.');
      }
      throw error;
    }
  }

  /**
   * Get reviews by a specific user
   * TODO: Backend endpoint not implemented yet
   */
  async getUserReviews(): Promise<ProductReview[]> {
    console.log('=== REVIEW SERVICE - GET USER REVIEWS ===');
    console.log('WARNING: Backend endpoint not implemented yet');
    return [];
  }

  /**
   * Check if user can review a product (has purchased it)
   * TODO: Backend endpoint not implemented yet
   */
  async canReviewProduct(productSlug: string): Promise<{
    can_review: boolean;
    has_purchased: boolean;
    existing_review?: ProductReview;
  }> {
    console.log('=== REVIEW SERVICE - CHECK CAN REVIEW ===');
    console.log('Product slug:', productSlug);
    console.log('WARNING: Backend endpoint not implemented yet');
    
    // For now, assume authenticated users can review
    return {
      can_review: true,
      has_purchased: true
    };
  }

  /**
   * Get aggregate review statistics for a product
   * TODO: Backend endpoint not implemented yet - calculating from reviews list
   */
  async getReviewStats(productSlug: string): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: { [key: number]: number };
  }> {
    console.log('=== REVIEW SERVICE - GET REVIEW STATS ===');
    console.log('Product slug:', productSlug);
    console.log('WARNING: Using calculated stats from reviews list');
    
    try {
      // Get reviews and calculate stats
      const reviews = await this.getProductReviews(productSlug);
      const total_reviews = reviews.length;
      
      if (total_reviews === 0) {
        return {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: {}
        };
      }
      
      const average_rating = reviews.reduce((sum, review) => sum + review.rating, 0) / total_reviews;
      const rating_distribution = reviews.reduce((dist, review) => {
        dist[review.rating] = (dist[review.rating] || 0) + 1;
        return dist;
      }, {} as { [key: number]: number });
      
      return { average_rating, total_reviews, rating_distribution };
    } catch (error) {
      console.error('=== REVIEW SERVICE ERROR ===');
      console.error('Error calculating review stats:', error);
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {}
      };
    }
  }
}

// Export singleton instance
export const reviewService = ReviewService.getInstance();
export default reviewService;