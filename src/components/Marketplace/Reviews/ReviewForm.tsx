import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from '../../Common/Select';
import ImageUpload from '../../Common/ImageUpload';
import { reviewService } from '../../../services';
import './Reviews.css';

interface ReviewFormProps {
  productSlug: string;
  onReviewSubmitted: () => void;
  onCancel?: () => void;
  existingReview?: {
    id: number;
    rating: number;
    title: string;
    comment: string;
  };
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  productSlug, 
  onReviewSubmitted, 
  onCancel,
  existingReview 
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(existingReview?.rating?.toString() || '5');
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ratingOptions = [
    { value: '5', label: '★★★★★ 5 Stars - Excellent' },
    { value: '4', label: '★★★★☆ 4 Stars - Very Good' },
    { value: '3', label: '★★★☆☆ 3 Stars - Good' },
    { value: '2', label: '★★☆☆☆ 2 Stars - Fair' },
    { value: '1', label: '★☆☆☆☆ 1 Star - Poor' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData = {
        rating: parseInt(rating),
        title: title.trim(),
        comment: comment.trim(),
        images: imageFiles.length > 0 ? imageFiles : undefined
      };

      if (existingReview) {
        await reviewService.updateReview(productSlug, existingReview.id, reviewData);
      } else {
        await reviewService.createReview(productSlug, reviewData);
      }

      // Reset form
      setRating('5');
      setTitle('');
      setComment('');
      setImageFiles([]);
      
      // Notify parent component
      onReviewSubmitted();
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h4>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h4>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="rating">Rating *</label>
          <Select
            value={rating}
            onChange={setRating}
            options={ratingOptions}
            placeholder="Select a rating"
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">Review Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience..."
            required
            maxLength={100}
            className="form-control"
          />
          <small className="form-hint">{title.length}/100 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Your Review *</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience with this product..."
            required
            minLength={10}
            maxLength={1000}
            rows={6}
            className="form-control"
          />
          <small className="form-hint">{comment.length}/1000 characters (minimum 10)</small>
        </div>

        <div className="form-group">
          <label>Add Photos (Optional)</label>
          <p className="form-hint">
            Upload photos of the product to help other customers. Max 5 photos, 5MB each.
          </p>
          <ImageUpload 
            files={imageFiles} 
            setFiles={setImageFiles}
            maxFiles={5}
            maxFileSize={5 * 1024 * 1024} // 5MB
            accept="image/*"
          />
        </div>

        <div className="review-form-actions">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || !title.trim() || comment.length < 10}
          >
            {isSubmitting 
              ? (existingReview ? 'Updating...' : 'Submitting...') 
              : (existingReview ? 'Update Review' : 'Submit Review')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;