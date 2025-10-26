import { apiRequest, API_ENDPOINTS } from '../../../shared/api';
import type { ProductReview } from '@/features/marketplace/model';

export class ReviewService {
  private static instance: ReviewService;

  public static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  async getProductReviews(productSlug: string): Promise<ProductReview[]> {
    try {
      return await apiRequest<ProductReview[]>(API_ENDPOINTS.PRODUCT_REVIEWS(productSlug));
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return [];
      }
      throw error;
    }
  }

  async createReview(
    productSlug: string,
    reviewData: { rating: number; title: string; comment: string; images?: File[] },
  ): Promise<ProductReview> {
    const formData = new FormData();
    // Always include product_slug for legacy endpoints; nested route will ignore it
    formData.append('product_slug', productSlug);
    formData.append('rating', reviewData.rating.toString());
    formData.append('title', reviewData.title);
    formData.append('comment', reviewData.comment);

    reviewData.images?.forEach((file) => formData.append('images', file));

    // Try product action endpoint first; fallback to legacy on 404/405
    try {
      return await apiRequest<ProductReview>(API_ENDPOINTS.PRODUCT_ADD_REVIEW(productSlug), {
        method: 'POST',
        body: formData,
        headers: {},
      });
    } catch (err) {
      if (err instanceof Error && /(404|405)/.test(err.message)) {
        return await apiRequest<ProductReview>(API_ENDPOINTS.PRODUCT_ADD_REVIEW_LEGACY, {
          method: 'POST',
          body: formData,
          headers: {},
        });
      }
      throw err;
    }
  }

  async updateReview(
    _productSlug: string,
    reviewId: number,
    reviewData: { rating?: number; title?: string; comment?: string; images?: File[] },
  ): Promise<ProductReview> {
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

    reviewData.images?.forEach((file) => formData.append('images', file));

    return apiRequest<ProductReview>(API_ENDPOINTS.PRODUCT_REVIEW_DETAIL(reviewId), {
      method: 'PATCH',
      body: formData,
    });
  }

  // Support both signatures for convenience
  async deleteReview(reviewId: number): Promise<void>;
  async deleteReview(productSlug: string, reviewId: number): Promise<void>;
  async deleteReview(arg1: number | string, arg2?: number): Promise<void> {
    const reviewId = typeof arg1 === 'number' ? arg1 : (arg2 as number);
    await apiRequest<void>(API_ENDPOINTS.PRODUCT_REVIEW_DETAIL(reviewId), { method: 'DELETE' });
  }

  async getUserReviews(): Promise<ProductReview[]> {
    return [];
  }

  async canReviewProduct(_productSlug: string): Promise<{
    can_review: boolean;
    has_purchased: boolean;
    existing_review?: ProductReview;
  }> {
    return {
      can_review: true,
      has_purchased: true,
    };
  }

  async getReviewStats(productSlug: string): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: Record<number, number>;
  }> {
    const reviews = await this.getProductReviews(productSlug);
    const totalReviews = reviews.length;

    if (!totalReviews) {
      return { average_rating: 0, total_reviews: 0, rating_distribution: {} };
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingDistribution = reviews.reduce<Record<number, number>>((distribution, review) => {
      distribution[review.rating] = (distribution[review.rating] ?? 0) + 1;
      return distribution;
    }, {});

    return {
      average_rating: averageRating,
      total_reviews: totalReviews,
      rating_distribution: ratingDistribution,
    };
  }
}

export const reviewService = ReviewService.getInstance();
export default reviewService;
