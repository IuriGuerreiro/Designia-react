import React, { useState, useEffect } from 'react';
import { type ProductReview } from '@/features/marketplace/model';
import { reviewService } from '@/features/marketplace/api';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useTranslation } from 'react-i18next';
import './ProductReviews.css';

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
        className={`star ${i <= rating ? 'filled' : 'empty'} star-${size}`}
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
  return <div className="star-rating">{stars}</div>;
};

// Rating Selector Component
const RatingSelector: React.FC<{ value: number; onChange: (rating: number) => void }> = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="rating-selector">
      <label className="rating-label">{t('reviews.form.rating')}</label>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`rating-star-button ${star <= value ? 'selected' : ''}`}
            onClick={() => onChange(star)}
            aria-label={t('reviews.form_extras.rating_value', { count: star })}
          >
            <svg
              className={`star ${star <= value ? 'filled' : 'empty'}`}
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
      <span className="rating-text">{t('reviews.form_extras.rating_value', { count: value })}</span>
    </div>
  );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productSlug, productId, reviews: initialReviews, variant = 'default' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
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
        <div className="review-prompt">
          <p>Please <a href="/login">log in</a> to leave a review.</p>
        </div>
      );
    }

    if (!hasPurchased) {
      return (
        <div className="review-prompt">
          <p>{t('reviews.prompts.purchase_required')}</p>
        </div>
      );
    }

    if (existingReview && !showReviewForm) {
      return (
        <div className="review-prompt">
          <p>{t('reviews.prompts.already_reviewed')}</p>
          <button
            onClick={() => handleEditReview(existingReview)}
            className="edit-review-btn"
          >
            {t('reviews.actions.edit_review')}
          </button>
        </div>
      );
    }

    if (canReview && !showReviewForm) {
      return (
        <div className="review-prompt">
          <button
            onClick={() => setShowReviewForm(true)}
            className="write-review-btn"
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
      <div className="product-reviews">
        <div className="reviews-loading">
          <div className="loading-spinner"></div>
          <p>{t('reviews.loading')}</p>
        </div>
      </div>
    );
  }

  // Simple list (Amazon-like): condensed, with basic actions
  if (variant === 'simple') {
    return (
      <div className="product-reviews simple">
        {/* Simple composer trigger */}
        {user && canReview && !showReviewForm && (
          <div className="review-prompt" style={{ textAlign: 'left' }}>
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
          <div className="review-form-container">
            <div className="form-header">
              <h4 className="form-title">{t('reviews.form_extras.share_title')}</h4>
              <p className="form-subtitle">{t('reviews.form_extras.share_subtitle')}</p>
            </div>
            <form className="review-form" onSubmit={handleSubmit}>
              <RatingSelector value={rating} onChange={setRating} />
              <div className="form-group">
                <label htmlFor="review-title" className="form-label">{t('reviews.form.title')}</label>
                <input
                  id="review-title"
                  type="text"
                  className="form-input"
                  placeholder={t('reviews.form_extras.title_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="review-comment" className="form-label">{t('reviews.form.comment')}</label>
                <textarea
                  id="review-comment"
                  rows={4}
                  className="form-textarea"
                  placeholder={t('reviews.form_extras.comment_placeholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    setRating(5);
                    setTitle('');
                    setComment('');
                  }}
                  disabled={isSubmitting}
                >
                  {t('reviews.actions.cancel')}
                </button>
                <button 
                  type="submit" 
                  className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('reviews.actions.submitting') : t('reviews.actions.submit_review')}
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <h4>{t('reviews.empty_title')}</h4>
              <p>{t('reviews.empty_message')}</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.reviewer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="reviewer-details">
                      <span className="reviewer-name">{review.reviewer_name}</span>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                  </div>
                  <div className="review-meta">
                    {review.is_verified_purchase && (
                      <div className="verified-badge">{t('reviews.verified_purchase')}</div>
                    )}
                    <div className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    {user && review.reviewer.id === user.id && (
                      <div className="review-actions" style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="action-btn edit-btn"
                        aria-label={t('reviews.actions.edit')}
                        onClick={() => handleEditReview(review)}
                      >
                        {t('reviews.actions.edit')}
                      </button>
                      <button
                        type="button"
                        className="action-btn delete-btn"
                        aria-label={t('reviews.actions.delete')}
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        {t('reviews.actions.delete')}
                      </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="review-content">
                  <h5 className="review-title">{review.title}</h5>
                  <p className="review-comment">{review.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="product-reviews">
      {/* Reviews Summary */}
      

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            {t('reviews.actions.retry')}
          </button>
        </div>
      )}

      {/* Review Prompt */}
      {renderReviewPrompt()}

      {/* Review Form */}
      {showReviewForm && (
        <div className="review-form-container">
          <div className="form-header">
            <h4 className="form-title">
              {editingReview ? t('reviews.actions.edit_review') : t('reviews.form_extras.share_title')}
            </h4>
            <p className="form-subtitle">{t('reviews.form_extras.share_subtitle')}</p>
          </div>
          
          <form className="review-form" onSubmit={handleSubmit}>
            <RatingSelector value={rating} onChange={setRating} />
            
            <div className="form-group">
              <label htmlFor="review-title" className="form-label">Review Title</label>
              <input
                id="review-title"
                type="text"
                className="form-input"
                placeholder="Summarize your experience..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="review-comment" className="form-label">Your Review</label>
              <textarea
                id="review-comment"
                rows={4}
                className="form-textarea"
                placeholder="Tell us about your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setRating(5);
                  setTitle('');
                  setComment('');
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    {editingReview ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  editingReview ? 'Update Review' : 'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <h4>No reviews yet</h4>
            <p>Be the first to share your experience with this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="reviewer-details">
                    <span className="reviewer-name">{review.reviewer_name}</span>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <div className="review-meta">
                  {review.is_verified_purchase && (
                    <div className="verified-badge">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Verified Purchase
                    </div>
                  )}
                  {user && review.reviewer.id === user.id && (
                    <div className="review-actions">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="action-btn edit-btn"
                        aria-label="Edit review"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.50023C18.8978 2.10297 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10297 21.5 2.50023C21.8978 2.89749 22.1218 3.43705 22.1218 3.99973C22.1218 4.56241 21.8978 5.10197 21.5 5.49923L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="action-btn delete-btn"
                        aria-label="Delete review"
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
              <div className="review-content">
                <h5 className="review-title">{review.title}</h5>
                <p className="review-comment">{review.comment}</p>
                <div className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
