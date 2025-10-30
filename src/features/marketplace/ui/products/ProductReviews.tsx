import React, { useState, useEffect } from 'react';
import { type ProductReview } from '@/features/marketplace/model';
import { reviewService } from '@/features/marketplace/api';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useTheme } from '@/shared/state/ThemeContext';
import { useTranslation } from 'react-i18next';
import styles from './ProductReviews.module.css';

interface ProductReviewsProps {
  productSlug?: string;
  productId: string;
  reviews: ProductReview[];
  variant?: 'default' | 'simple';
}

// Star Rating Component
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`${styles['star']} ${i <= rating ? styles['filled'] : styles['empty']} ${styles[`star-${size}`]}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return <div className={styles['star-rating']}>{stars}</div>;
};

// Rating Selector Component
const RatingSelector: React.FC<{ value: number; onChange: (rating: number) => void }> = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className={styles['rating-selector']}>
      <label className={styles['rating-label']}>{t('reviews.form.rating')}</label>
      <div className={styles['rating-stars']}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles['rating-star-button']} ${star <= value ? styles['selected'] : ''}`}
            onClick={() => onChange(star)}
            aria-label={t('reviews.form_extras.rating_value', { count: star })}
          >
            <svg
              className={`${styles['star']} ${star <= value ? styles['filled'] : styles['empty']}`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
      <span className={styles['rating-text']}>{t('reviews.form_extras.rating_value', { count: value })}</span>
    </div>
  );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productSlug, productId, reviews: initialReviews, variant = 'default' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tokens } = useTheme();
  
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [existingReview, setExistingReview] = useState<ProductReview | null>(null);
  const [reviewStats, setReviewStats] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_distribution: {} as { [key: number]: number }
  });

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Load reviews and review eligibility
  useEffect(() => {
    const loadReviewsData = async () => {
      if (!productSlug) return;
      
      setLoading(true);
      setError(null);

      try {
        // Load reviews
        const reviewsData = await reviewService.getProductReviews(productSlug);
        setReviews(reviewsData);

        // Load review stats
        const stats = await reviewService.getReviewStats(productSlug);
        setReviewStats(stats);

        // Check if user can review (only if authenticated)
        if (user) {
          const eligibility = await reviewService.canReviewProduct(productSlug);
          setCanReview(eligibility.can_review);
          setHasPurchased(eligibility.has_purchased);
          // Note: existing_review is not implemented in the service yet
          setExistingReview(null);
        }
      } catch (err) {
        console.error('Failed to load reviews data:', err);
        setError(t('reviews.errors.load_failed'));
      } finally {
        setLoading(false);
      }
    };

    loadReviewsData();
  }, [productSlug, user]);

  const handleReviewSubmitted = async () => {
    setShowReviewForm(false);
    setEditingReview(null);
    
    // Reset form
    setRating(5);
    setTitle('');
    setComment('');
    
    // Reload reviews and stats
    if (productSlug) {
      try {
        const [reviewsData, stats, eligibility] = await Promise.all([
          reviewService.getProductReviews(productSlug),
          reviewService.getReviewStats(productSlug),
          user ? reviewService.canReviewProduct(productSlug) : Promise.resolve({ can_review: false, has_purchased: false })
        ]);
        
        setReviews(reviewsData);
        setReviewStats(stats);
        
        if (user) {
          setCanReview(eligibility.can_review);
          setHasPurchased(eligibility.has_purchased);
          // Note: existing_review is not implemented in the service yet
          setExistingReview(null);
        }
      } catch (err) {
        console.error('Failed to reload reviews:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productSlug) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (editingReview) {
        // Update existing review
        await reviewService.updateReview(productSlug, editingReview.id, {
          rating,
          title,
          comment
        });
      } else {
        // Create new review
        await reviewService.createReview(productSlug, {
          rating,
          title,
          comment
        });
      }
      
      await handleReviewSubmitted();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = (review: ProductReview) => {
    setEditingReview(review);
    setRating(review.rating);
    setTitle(review.title);
    setComment(review.comment);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!productSlug || !confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await reviewService.deleteReview(productSlug, reviewId);
      await handleReviewSubmitted();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review';
      setError(errorMessage);
    }
  };

  const renderReviewPrompt = () => {
    if (!user) {
      return (
        <div className={styles['review-prompt']}>
          <p>Please <a href="/login">log in</a> to leave a review.</p>
        </div>
      );
    }

    if (!hasPurchased) {
      return (
        <div className={styles['review-prompt']}>
          <p>{t('reviews.prompts.purchase_required')}</p>
        </div>
      );
    }

    if (existingReview && !showReviewForm) {
      return (
        <div className={styles['review-prompt']}>
          <p>{t('reviews.prompts.already_reviewed')}</p>
          <button
            onClick={() => handleEditReview(existingReview)}
            className={styles['edit-review-btn']}
          >
            {t('reviews.actions.edit_review')}
          </button>
        </div>
      );
    }

    if (canReview && !showReviewForm) {
      return (
        <div className={styles['review-prompt']}>
          <button
            onClick={() => setShowReviewForm(true)}
            className={styles['write-review-btn']}
          >
            Write a Review
          </button>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className={styles['product-reviews']}>
        <div className={styles['reviews-loading']}>
          <div className={styles['loading-spinner']}></div>
          <p>{t('reviews.loading')}</p>
        </div>
      </div>
    );
  }

  // Simple list (Amazon-like): condensed, with basic actions
  if (variant === 'simple') {
    return (
      <div className={`${styles['product-reviews']} ${styles['simple']}`}>
        {/* Simple composer trigger */}
        {user && canReview && !showReviewForm && (
          <div className={styles['review-prompt']} style={{ textAlign: 'left' }}>
            <button
              type="button"
              className="write-review-btn"
              onClick={() => setShowReviewForm(true)}
            >
              {t('reviews.actions.write_review')}
            </button>
          </div>
        )}

        {/* Simple inline form */}
        {showReviewForm && (
          <div 
            className={styles['review-form-container']}
            style={{ 
              background: tokens.surface,
              borderColor: tokens.border,
              boxShadow: tokens.shadow 
            }}
          >
            <div className={styles['form-header']}>
              <h4 
                className={styles['form-title']}
                style={{ color: tokens.textPrimary }}
              >
                {t('reviews.form_extras.share_title')}
              </h4>
              <p 
                className={styles['form-subtitle']}
                style={{ color: tokens.textMuted }}
              >
                {t('reviews.form_extras.share_subtitle')}
              </p>
            </div>
            <form className={styles['review-form']} onSubmit={handleSubmit}>
              <div className={styles['form-group']}>
                <label 
                  className={styles['form-label']} 
                  style={{ color: tokens.textSecondary }}
                >
                  {t('reviews.form.rating')}
                </label>
                <div className={styles['starRating']}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${styles['rating-star-button']} ${star <= (hoveredStar || rating) ? styles['selected'] : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      style={{
                        color: star <= (hoveredStar || rating) ? tokens.warning : tokens.textMuted
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className={styles['rating-display']}>
                  <span className={styles['rating-stars']}>
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                  </span>
                  <span style={{ color: tokens.textSecondary, fontSize: '0.875rem' }}>
                    {rating === 5 ? 'Excellent' : 
                     rating === 4 ? 'Very Good' : 
                     rating === 3 ? 'Good' : 
                     rating === 2 ? 'Fair' : 'Poor'}
                  </span>
                </div>
              </div>
              <div className={styles['form-group']}>
                <label 
                  htmlFor="review-title" 
                  className={styles['form-label']}
                  style={{ color: tokens.textSecondary }}
                >
                  {t('reviews.form.title')}
                </label>
                <input
                  id="review-title"
                  type="text"
                  className={styles['form-input']}
                  placeholder={t('reviews.form_extras.title_placeholder')}
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ 
                    background: tokens.surfaceAlt,
                    color: tokens.textPrimary,
                    borderColor: tokens.border 
                  }}
                />
                <div className={`${styles['char-counter']} ${title.length > 80 ? styles['warning'] : ''}`}
                     style={{ color: title.length > 80 ? tokens.warning : tokens.textMuted }}>
                  {title.length}/100
                </div>
              </div>
              <div className={styles['form-group']}>
                <label 
                  htmlFor="review-comment" 
                  className={styles['form-label']}
                  style={{ color: tokens.textSecondary }}
                >
                  {t('reviews.form.comment')}
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  className={styles['form-textarea']}
                  placeholder={t('reviews.form_extras.comment_placeholder')}
                  value={comment}
                  maxLength={1000}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  style={{ 
                    background: tokens.surfaceAlt,
                    color: tokens.textPrimary,
                    borderColor: tokens.border 
                  }}
                />
                <div className={`${styles['char-counter']} ${comment.length > 800 ? styles['warning'] : ''}`}
                     style={{ color: comment.length > 800 ? tokens.warning : tokens.textMuted }}>
                  {comment.length}/1000
                </div>
              </div>
              <div className={styles['form-actions']}>
                <button
                  type="button"
                  className={styles['cancel-btn']}
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setRating(5);
                    setTitle('');
                    setComment('');
                  }}
                  disabled={isSubmitting}
                  style={{ 
                    background: tokens.backgroundAccent,
                    color: tokens.textSecondary,
                    borderColor: tokens.border 
                  }}
                >
                  {t('reviews.actions.cancel')}
                </button>
                <button 
                  type="submit" 
                  className={`${styles['submit-button']} ${isSubmitting ? styles['loading'] : ''}`}
                  disabled={isSubmitting}
                  style={{ 
                    background: tokens.buttonGradient,
                    color: tokens.accentContrast 
                  }}
                >
                  {isSubmitting ? t('reviews.actions.submitting') : t('reviews.actions.submit_review')}
                </button>
              </div>
            </form>
          </div>
        )}
        <div className={styles['reviews-list']}>
          {reviews.length === 0 ? (
            <div className={styles['no-reviews']}>
              <h4 style={{ color: tokens.textPrimary }}>{t('reviews.empty_title')}</h4>
              <p style={{ color: tokens.textMuted }}>{t('reviews.empty_message')}</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div 
                key={review.id} 
                className={styles['review-card']}
                style={{ 
                  background: tokens.surface,
                  borderColor: tokens.border,
                  boxShadow: tokens.shadow 
                }}
              >
                <div className={styles['review-header']}>
                  <div className={styles['reviewer-info']}>
                    <div 
                      className={styles['reviewer-avatar']}
                      style={{ 
                        background: tokens.buttonGradient,
                        color: tokens.accentContrast 
                      }}
                    >
                      {review.reviewer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles['reviewer-details']}>
                      <span 
                        className={styles['reviewer-name']}
                        style={{ color: tokens.textPrimary }}
                      >
                        {review.reviewer_name}
                      </span>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                  </div>
                  <div className={styles['review-meta']}>
                    {review.is_verified_purchase && (
                      <div 
                        className={styles['verified-badge']}
                        style={{ 
                          background: `${tokens.success}1A`,
                          color: tokens.success,
                          borderColor: `${tokens.success}4D`
                        }}
                      >
                        {t('reviews.verified_purchase')}
                      </div>
                    )}
                    <div 
                      className={styles['review-date']}
                      style={{ color: tokens.textMuted }}
                    >
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    {user && review.reviewer.id === user.id && (
                      <div className={styles['review-actions']}>
                      <button
                        type="button"
                        className={`${styles['action-btn']} ${styles['edit-btn']}`}
                        aria-label={t('reviews.actions.edit')}
                        onClick={() => handleEditReview(review)}
                        style={{ 
                          background: tokens.surface,
                          borderColor: tokens.border,
                          color: tokens.textMuted
                        }}
                      >
                        {t('reviews.actions.edit')}
                      </button>
                      <button
                        type="button"
                        className={`${styles['action-btn']} ${styles['delete-btn']}`}
                        aria-label={t('reviews.actions.delete')}
                        onClick={() => handleDeleteReview(review.id)}
                        style={{ 
                          background: tokens.surface,
                          borderColor: tokens.border,
                          color: tokens.textMuted
                        }}
                      >
                        {t('reviews.actions.delete')}
                      </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles['review-content']}>
                  <h5 
                    className={styles['review-title']}
                    style={{ color: tokens.textPrimary }}
                  >
                    {review.title}
                  </h5>
                  <p 
                    className={styles['review-comment']}
                    style={{ color: tokens.textSecondary }}
                  >
                    {review.comment}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles['product-reviews']}>
      {/* Reviews Summary */}
      

      {/* Error Message */}
      {error && (
        <div 
          className={styles['error-message']}
          style={{ 
            color: tokens.error, 
            background: `${tokens.error}1A`, 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: `1px solid ${tokens.error}4D` 
          }}
        >
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles['retry-btn']}
            style={{ 
              background: tokens.error,
              color: tokens.accentContrast 
            }}
          >
            {t('reviews.actions.retry')}
          </button>
        </div>
      )}

      {/* Review Prompt */}
      {renderReviewPrompt()}

      {/* Review Form */}
      {showReviewForm && (
        <div 
          className={styles['review-form-container']}
          style={{ 
            background: tokens.surface,
            borderColor: tokens.border,
            boxShadow: tokens.shadow 
          }}
        >
          <div className={styles['form-header']}>
            <h4 
              className={styles['form-title']}
              style={{ color: tokens.textPrimary }}
            >
              {editingReview ? t('reviews.actions.edit_review') : t('reviews.form_extras.share_title')}
            </h4>
            <p 
              className={styles['form-subtitle']}
              style={{ color: tokens.textMuted }}
            >
              {t('reviews.form_extras.share_subtitle')}
            </p>
          </div>
          
          <form className={styles['review-form']} onSubmit={handleSubmit}>
            <div className={styles['form-group']}>
              <label 
                className={styles['form-label']} 
                style={{ color: tokens.textSecondary }}
              >
                {t('reviews.form.rating')}
              </label>
              <div className={styles['starRating']}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles['rating-star-button']} ${star <= (hoveredStar || rating) ? styles['selected'] : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    style={{
                      color: star <= (hoveredStar || rating) ? tokens.warning : tokens.textMuted
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className={styles['rating-display']}>
                <span className={styles['rating-stars']}>
                  {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                </span>
                <span style={{ color: tokens.textSecondary, fontSize: '0.875rem' }}>
                  {rating === 5 ? 'Excellent' : 
                   rating === 4 ? 'Very Good' : 
                   rating === 3 ? 'Good' : 
                   rating === 2 ? 'Fair' : 'Poor'}
                </span>
              </div>
            </div>
            
            <div className={styles['form-group']}>
              <label 
                htmlFor="review-title" 
                className={styles['form-label']}
                style={{ color: tokens.textSecondary }}
              >
                {t('reviews.form.title')}
              </label>
              <input
                id="review-title"
                type="text"
                className={styles['form-input']}
                placeholder={t('reviews.form_extras.title_placeholder')}
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ 
                  background: tokens.surfaceAlt,
                  color: tokens.textPrimary,
                  borderColor: tokens.border 
                }}
              />
              <div className={`${styles['char-counter']} ${title.length > 80 ? styles['warning'] : ''}`}
                   style={{ color: title.length > 80 ? tokens.warning : tokens.textMuted }}>
                {title.length}/100
              </div>
            </div>
            
            <div className={styles['form-group']}>
              <label 
                htmlFor="review-comment" 
                className={styles['form-label']}
                style={{ color: tokens.textSecondary }}
              >
                {t('reviews.form.comment')}
              </label>
              <textarea
                id="review-comment"
                rows={4}
                className={styles['form-textarea']}
                placeholder={t('reviews.form_extras.comment_placeholder')}
                value={comment}
                maxLength={1000}
                onChange={(e) => setComment(e.target.value)}
                required
                style={{ 
                  background: tokens.surfaceAlt,
                  color: tokens.textPrimary,
                  borderColor: tokens.border 
                }}
              />
              <div className={`${styles['char-counter']} ${comment.length > 800 ? styles['warning'] : ''}`}
                   style={{ color: comment.length > 800 ? tokens.warning : tokens.textMuted }}>
                {comment.length}/1000
              </div>
            </div>
            
            <div className={styles['form-actions']}>
              <button 
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setRating(5);
                  setTitle('');
                  setComment('');
                }}
                className={styles['cancel-btn']}
                style={{ 
                  background: tokens.backgroundAccent,
                  color: tokens.textSecondary,
                  borderColor: tokens.border 
                }}
              >
                {t('reviews.actions.cancel')}
              </button>
              <button 
                type="submit" 
                className={`${styles['submit-button']} ${isSubmitting ? styles['loading'] : ''}`}
                disabled={isSubmitting}
                style={{ 
                  background: tokens.buttonGradient,
                  color: tokens.accentContrast 
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles['spinner']}></div>
                    {editingReview ? t('reviews.actions_extra.updating') : t('reviews.actions.submitting')}
                  </>
                ) : (
                  editingReview ? t('reviews.actions_extra.update_review') : t('reviews.actions.submit_review')
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className={styles['reviews-list']}>
        {reviews.length === 0 ? (
          <div className={styles['no-reviews']}>
            <h4 style={{ color: tokens.textPrimary }}>{t('reviews.empty_title')}</h4>
            <p style={{ color: tokens.textMuted }}>{t('reviews.empty_message')}</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div 
              key={review.id} 
              className={styles['review-card']}
              style={{ 
                background: tokens.surface,
                borderColor: tokens.border,
                boxShadow: tokens.shadow 
              }}
            >
              <div className={styles['review-header']}>
                <div className={styles['reviewer-info']}>
                  <div 
                    className={styles['reviewer-avatar']}
                    style={{ 
                      background: tokens.buttonGradient,
                      color: tokens.accentContrast 
                    }}
                  >
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles['reviewer-details']}>
                    <span 
                      className={styles['reviewer-name']}
                      style={{ color: tokens.textPrimary }}
                    >
                      {review.reviewer_name}
                    </span>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <div className={styles['review-meta']}>
                  {review.is_verified_purchase && (
                    <div 
                      className={styles['verified-badge']}
                      style={{ 
                        background: `${tokens.success}1A`,
                        color: tokens.success,
                        borderColor: `${tokens.success}4D`
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('reviews.verified_purchase')}
                    </div>
                  )}
                  <div 
                    className={styles['review-date']}
                    style={{ color: tokens.textMuted }}
                  >
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                  {user && review.reviewer.id === user.id && (
                    <div className={styles['review-actions']}>
                      <button
                        onClick={() => handleEditReview(review)}
                        className={`${styles['action-btn']} ${styles['edit-btn']}`}
                        aria-label="Edit review"
                        style={{ 
                          background: tokens.surface,
                          borderColor: tokens.border,
                          color: tokens.textMuted
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.50023C18.8978 2.10297 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10297 21.5 2.50023C21.8978 2.89749 22.1218 3.43705 22.1218 3.99973C22.1218 4.56241 21.8978 5.10197 21.5 5.49923L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className={`${styles['action-btn']} ${styles['delete-btn']}`}
                        aria-label="Delete review"
                        style={{ 
                          background: tokens.surface,
                          borderColor: tokens.border,
                          color: tokens.textMuted
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles['review-content']}>
                <h5 
                  className={styles['review-title']}
                  style={{ color: tokens.textPrimary }}
                >
                  {review.title}
                </h5>
                <p 
                  className={styles['review-comment']}
                  style={{ color: tokens.textSecondary }}
                >
                  {review.comment}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
