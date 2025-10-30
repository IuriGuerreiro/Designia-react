import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/state/ThemeContext';
import { reviewService } from '@/features/marketplace/api';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
  productSlug: string;
  onReviewSubmitted: () => void;
  onCancel?: () => void;
  existingReview?: { id: number; rating: number; title: string; comment: string; };
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productSlug, onReviewSubmitted, onCancel, existingReview }) => {
  const { t } = useTranslation();
  const { tokens } = useTheme();
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const reviewData = { rating, title, comment };
      if (existingReview) {
        await reviewService.updateReview(productSlug, existingReview.id, reviewData);
      } else {
        await reviewService.createReview(productSlug, reviewData);
      }
      onReviewSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reviews.errors.submit_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={styles.formContainer}
      style={{ 
        background: tokens.surface,
        borderColor: tokens.border,
        boxShadow: tokens.shadow 
      }}
    >
      <h3 
        className={styles.header}
        style={{ color: tokens.textPrimary }}
      >
        {existingReview ? t('reviews.actions.edit_review') : t('reviews.actions.write_review')}
      </h3>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label 
            className={styles.label} 
            style={{ color: tokens.textSecondary }}
          >
            {t('reviews.form.rating')}
          </label>
          <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles.starButton} ${star <= (hoveredStar || rating) ? styles.active : ''}`}
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
          <div className={styles.ratingDisplay}>
            <span className={styles.ratingStars}>
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
        <div className={styles.formGroup}>
          <label 
            className={styles.label} 
            htmlFor="title"
            style={{ color: tokens.textSecondary }}
          >
            {t('reviews.form.title')}
          </label>
          <input 
            id="title" 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
            maxLength={100}
            className={styles.input}
            style={{ 
              background: tokens.surfaceAlt,
              color: tokens.textPrimary,
              borderColor: tokens.border 
            }}
          />
          <div className={`${styles.charCounter} ${title.length > 80 ? styles.warning : ''}`}>
            {title.length}/100
          </div>
        </div>
        <div className={styles.formGroup}>
          <label 
            className={styles.label} 
            htmlFor="comment"
            style={{ color: tokens.textSecondary }}
          >
            {t('reviews.form.comment')}
          </label>
          <textarea 
            id="comment" 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            required 
            rows={5} 
            maxLength={1000}
            className={styles.textarea}
            style={{ 
              background: tokens.surfaceAlt,
              color: tokens.textPrimary,
              borderColor: tokens.border 
            }}
          ></textarea>
          <div className={`${styles.charCounter} ${comment.length > 800 ? styles.warning : ''}`}>
            {comment.length}/1000
          </div>
        </div>
        <div className={styles.formActions}>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ 
                background: tokens.backgroundAccent,
                color: tokens.textSecondary,
                borderColor: tokens.border 
              }}
            >
              {t('reviews.actions.cancel')}
            </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`${styles.btn} ${styles.btnPrimary} ${isSubmitting ? styles.loading : ''}`}
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
  );
};

export default ReviewForm;
