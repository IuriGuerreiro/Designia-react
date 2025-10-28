import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ProductReview } from '@/features/marketplace/model';
import { reviewService } from '@/features/marketplace/api';
import './Reviews.css';

interface ReviewListProps {
  reviews: ProductReview[];
  productSlug: string;
  currentUserId?: string | number;
  onReviewDeleted?: () => void;
  onReviewEdit?: (review: ProductReview) => void;
  loading?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({ 
  reviews,
  productSlug,
  currentUserId, 
  onReviewDeleted,
  onReviewEdit,
  loading = false
}) => {
  const { t } = useTranslation();
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm(t('reviews.confirm_delete'))){
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      await reviewService.deleteReview(productSlug, reviewId);
      if (onReviewDeleted) {
        onReviewDeleted();
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert(t('reviews.errors.delete_failed'));
    } finally {
      setDeletingReviewId(null);
    }
  };

  const toggleExpandReview = (reviewId: number) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderImages = (images: any[]) => {
    if (!images || images.length === 0) return null;

    return (
      <div className="review-images">
        {images.map((image, index) => (
          <div key={index} className="review-image-container">
            <img
              src={image.image}
              alt={image.alt_text || `Review image ${index + 1}`}
              className="review-image"
              onClick={() => {
                // Open image in modal or new tab
                window.open(image.image, '_blank');
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="no-reviews">
        <div className="no-reviews-content">
          <h4>{t('reviews.empty_title')}</h4>
          <p>{t('reviews.empty_message')}</p>
        </div>
      </div>
    );
  }

  // Skeleton loading component
  const ReviewSkeleton = () => (
    <div className="review-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-info">
          <div className="skeleton-name"></div>
          <div className="skeleton-meta">
            <div className="skeleton-stars"></div>
            <div className="skeleton-date"></div>
          </div>
        </div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-comment">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    </div>
  );

  // Show skeleton loading if loading is true
  if (loading) {
    return (
      <div className="reviews-list">
        {[1, 2, 3].map((index) => (
          <ReviewSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="reviews-list">
      {reviews.map((review) => {
        const isExpanded = expandedReviews.has(review.id);
        const isLongComment = review.comment.length > 200;
        const displayComment = isLongComment && !isExpanded 
          ? review.comment.substring(0, 200) + '...' 
          : review.comment;
        const isOwnReview = currentUserId && review.reviewer.id === currentUserId;

        return (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-details">
                  <div className="reviewer-name-container">
                    <span className="reviewer-name">{review.reviewer_name}</span>
                    {review.is_verified_purchase && (
                      <span className="verified-badge" title="Verified Purchase">
                        <span className="verified-icon">✓</span>
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <div className="review-meta">
                    {renderStars(review.rating)}
                    <span className="review-date">{formatDate(review.created_at)}</span>
                  </div>
                </div>
              </div>
              
              {isOwnReview && (
                <div className="review-actions">
                  <button
                    onClick={() => onReviewEdit && onReviewEdit(review)}
                    className="btn btn-sm btn-secondary"
                    title={t('reviews.actions.edit_review')}
                  >
                    {t('reviews.actions.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deletingReviewId === review.id}
                    className="btn btn-sm btn-danger"
                    title={t('reviews.actions.delete_review')}
                  >
                    {deletingReviewId === review.id ? t('reviews.actions.deleting') : t('reviews.actions.delete')}
                  </button>
                </div>
              )}
            </div>

            <div className="review-content">
              {review.title && (
                <h5 className="review-title">{review.title}</h5>
              )}
              
              <div className="review-comment">
                <p>{displayComment}</p>
                {isLongComment && (
                  <button
                    onClick={() => toggleExpandReview(review.id)}
                    className="btn-link expand-review"
                  >
                    {isExpanded ? t('reviews.actions.show_less') : t('reviews.actions.read_more')}
                  </button>
                )}
              </div>

              {renderImages(review.images)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
