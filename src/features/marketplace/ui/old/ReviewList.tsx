import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/state/ThemeContext';
import { type ProductReview } from '@/features/marketplace/model';
import { reviewService } from '@/features/marketplace/api';
import styles from './ReviewList.module.css';

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
  const { tokens } = useTheme();
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
      <div className={styles.reviewStars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.filled : styles.empty}`}
            style={{ color: star <= rating ? tokens.warning : tokens.textMuted }}
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
      <div className={styles.reviewImages}>
        {images.map((image, index) => (
          <div 
            key={index} 
            className={styles.reviewImageContainer}
            style={{ borderColor: tokens.border }}
            onClick={() => {
              // Open image in modal or new tab
              window.open(image.image, '_blank');
            }}
          >
            <img
              src={image.image}
              alt={image.alt_text || `Review image ${index + 1}`}
              className={styles.reviewImage}
            />
          </div>
        ))}
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div 
        className={styles.noReviews}
        style={{ 
          background: tokens.surface,
          borderColor: tokens.border 
        }}
      >
        <div className={styles.noReviewsContent}>
          <h4 style={{ color: tokens.textPrimary }}>
            {t('reviews.empty_title')}
          </h4>
          <p style={{ color: tokens.textSecondary }}>
            {t('reviews.empty_message')}
          </p>
        </div>
      </div>
    );
  }

  // Skeleton loading component
  const ReviewSkeleton = () => (
    <div 
      className={styles.reviewSkeleton}
      style={{ 
        background: tokens.surface,
        borderColor: tokens.border 
      }}
    >
      <div className={styles.skeletonHeader}>
        <div 
          className={styles.skeletonAvatar}
          style={{
            background: `linear-gradient(90deg, ${tokens.muted} 25%, ${tokens.border} 50%, ${tokens.muted} 75%)`,
            backgroundSize: '200% 100%'
          }}
        ></div>
        <div className={styles.skeletonInfo}>
          <div 
            className={styles.skeletonName}
            style={{
              background: `linear-gradient(90deg, ${tokens.muted} 25%, ${tokens.border} 50%, ${tokens.muted} 75%)`,
              backgroundSize: '200% 100%'
            }}
          ></div>
          <div className={styles.skeletonMeta}>
            <div 
              className={styles.skeletonStars}
              style={{
                background: `linear-gradient(90deg, ${tokens.muted} 25%, ${tokens.border} 50%, ${tokens.muted} 75%)`,
                backgroundSize: '200% 100%'
              }}
            ></div>
            <div 
              className={styles.skeletonDate}
              style={{
                background: `linear-gradient(90deg, ${tokens.muted} 25%, ${tokens.border} 50%, ${tokens.muted} 75%)`,
                backgroundSize: '200% 100%'
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className={styles.skeletonContent}>
        <div 
          className={styles.skeletonTitle}
          style={{
            background: `linear-gradient(90deg, ${tokens.muted} 25%, ${tokens.border} 50%, ${tokens.muted} 75%)`,
            backgroundSize: '200% 100%'
          }}
        ></div>
        <div className={styles.skeletonComment}>
          <div 
            className={styles.skeletonLine}
            style={{
              background: `linear-gradient(90deg, ${tokens.muted} 25%, ${tokens.border} 50%, ${tokens.muted} 75%)`,
              backgroundSize: '200% 100%'
            }}
          ></div>
          <div 
            className={styles.skeletonLine}
            style={{
              background: `linear-gradient(90deg, ${tokens.muted} 25%, ${tokens.border} 50%, ${tokens.muted} 75%)`,
              backgroundSize: '200% 100%'
            }}
          ></div>
          <div 
            className={`${styles.skeletonLine} ${styles.short}`}
            style={{
              background: `linear-gradient(90deg, ${tokens.muted} 25%, ${tokens.border} 50%, ${tokens.muted} 75%)`,
              backgroundSize: '200% 100%'
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  // Show skeleton loading if loading is true
  if (loading) {
    return (
      <div className={styles.reviewsList}>
        {[1, 2, 3].map((index) => (
          <ReviewSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.reviewsList}>
      {reviews.map((review) => {
        const isExpanded = expandedReviews.has(review.id);
        const isLongComment = review.comment.length > 200;
        const displayComment = isLongComment && !isExpanded 
          ? review.comment.substring(0, 200) + '...' 
          : review.comment;
        const isOwnReview = currentUserId && review.reviewer.id === currentUserId;

        return (
          <div 
            key={review.id} 
            className={styles.reviewCard}
            style={{ 
              background: tokens.surface,
              borderColor: tokens.border 
            }}
          >
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                <div className={styles.reviewerDetails}>
                  <div className={styles.reviewerNameContainer}>
                    <span 
                      className={styles.reviewerName}
                      style={{ color: tokens.textPrimary }}
                    >
                      {review.reviewer_name}
                    </span>
                    {review.is_verified_purchase && (
                      <span 
                        className={styles.verifiedBadge} 
                        title={t('reviews.verified_purchase')}
                        style={{ 
                          background: `${tokens.success}1A`,
                          color: tokens.success,
                          borderColor: `${tokens.success}4D` 
                        }}
                      >
                        <span className={styles.verifiedIcon}>✓</span>
                        {t('reviews.verified_purchase')}
                      </span>
                    )}
                  </div>
                  <div className={styles.reviewMeta}>
                    {renderStars(review.rating)}
                    <span 
                      className={styles.reviewDate}
                      style={{ color: tokens.textMuted }}
                    >
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              {isOwnReview && (
                <div className={styles.reviewActions}>
                  <button
                    onClick={() => onReviewEdit && onReviewEdit(review)}
                    className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
                    title={t('reviews.actions.edit_review')}
                    style={{ 
                      background: tokens.backgroundAccent,
                      color: tokens.textSecondary,
                      borderColor: tokens.border 
                    }}
                  >
                    {t('reviews.actions.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deletingReviewId === review.id}
                    className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                    title={t('reviews.actions.delete_review')}
                    style={{ 
                      background: `${tokens.error}1A`,
                      color: tokens.error,
                      borderColor: `${tokens.error}4D` 
                    }}
                  >
                    {deletingReviewId === review.id ? t('reviews.actions.deleting') : t('reviews.actions.delete')}
                  </button>
                </div>
              )}
            </div>

            <div className={styles.reviewContent}>
              {review.title && (
                <h5 
                  className={styles.reviewTitle}
                  style={{ color: tokens.textPrimary }}
                >
                  {review.title}
                </h5>
              )}
              
              <div className={styles.reviewComment}>
                <p style={{ color: tokens.textSecondary }}>
                  {displayComment}
                </p>
                {isLongComment && (
                  <button
                    onClick={() => toggleExpandReview(review.id)}
                    className={`${styles.btnLink} ${styles.expandReview}`}
                    style={{ color: tokens.accent }}
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
