import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { reviewService } from '../../../features/marketplace/api';
import styles from './Reviews.module.css';

interface ReviewFormProps {
  productSlug: string;
  onReviewSubmitted: () => void;
  onCancel?: () => void;
  existingReview?: { id: number; rating: number; title: string; comment: string; };
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productSlug, onReviewSubmitted, onCancel, existingReview }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.header}>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="rating">Rating</label>
          <select id="rating" value={rating} onChange={e => setRating(Number(e.target.value))} className={styles.select}>
            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="title">Title</label>
          <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="comment">Comment</label>
          <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} required rows={5} className={styles.textarea}></textarea>
        </div>
        <div className={styles.formActions}>
          {onCancel && <button type="button" onClick={onCancel} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>}
          <button type="submit" disabled={isSubmitting} className={`${styles.btn} ${styles.btnPrimary}`}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
