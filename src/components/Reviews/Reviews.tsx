import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type ProductReview } from '../../types/marketplace';
import { reviewService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import './Reviews.css';

interface ReviewsProps {
  productSlug: string;
  productId: string;
  initialReviews?: ProductReview[];
  showAverageRating?: boolean;
}

const Reviews: React.FC<ReviewsProps> = ({ 
  productSlug, 
  productId, 
  initialReviews = [],
  showAverageRating = true 
}) => {
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

  // Load reviews and review eligibility
  useEffect(() => {
    const loadReviewsData = async () => {
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
          setExistingReview(eligibility.existing_review || null);
        }
      } catch (err) {
        console.error('Failed to load reviews data:', err);
        setError('Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadReviewsData();
  }, [productSlug, user]);

  const handleReviewSubmitted = async () => {
    setShowReviewForm(false);
    setEditingReview(null);
    
    // Reload reviews and stats
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
        setExistingReview(eligibility.existing_review || null);
      }
    } catch (err) {
      console.error('Failed to reload reviews:', err);
    }
  };

  const handleReviewDeleted = () => {
    handleReviewSubmitted(); // Reload data
  };

  const handleEditReview = (review: ProductReview) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const renderAverageRating = () => {
    if (!showAverageRating || reviewStats.total_reviews === 0) {
      return null;
    }

    return (
      <div className="average-rating-section">
        <div className="average-rating-summary">
          <div className="average-rating-number">
            <span className="rating-value">{reviewStats.average_rating.toFixed(1)}</span>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= Math.round(reviewStats.average_rating) ? 'filled' : 'empty'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="rating-info">
            <p className="total-reviews">
              Based on {reviewStats.total_reviews} review{reviewStats.total_reviews !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Rating distribution */}
        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = reviewStats.rating_distribution[rating] || 0;
            const percentage = reviewStats.total_reviews > 0 ? (count / reviewStats.total_reviews) * 100 : 0;
            
            return (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating} ★</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="rating-count">({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    );
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
          <p>You need to purchase this product before you can leave a review.</p>
        </div>
      );
    }

    if (existingReview && !showReviewForm) {
      return (
        <div className="review-prompt">
          <p>You have already reviewed this product.</p>
          <button
            onClick={() => handleEditReview(existingReview)}
            className="btn btn-secondary"
          >
            Edit Your Review
          </button>
        </div>
      );
    }

    if (canReview && !showReviewForm) {
      return (
        <div className="review-prompt">
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn btn-primary"
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
      <div className="reviews-section">
        <div className="loading-message">
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h3>Customer Reviews</h3>
        {renderAverageRating()}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-secondary"
          >
            Retry
          </button>
        </div>
      )}

      {renderReviewPrompt()}

      {showReviewForm && (
        <ReviewForm
          productSlug={productSlug}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
          existingReview={editingReview ? {
            id: editingReview.id,
            rating: editingReview.rating,
            title: editingReview.title,
            comment: editingReview.comment
          } : undefined}
        />
      )}

      <ReviewList
        reviews={reviews}
        productSlug={productSlug}
        currentUserId={user?.id}
        onReviewDeleted={handleReviewDeleted}
        onReviewEdit={handleEditReview}
      />
    </div>
  );
};

export default Reviews;