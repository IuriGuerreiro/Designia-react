import React, { useState } from 'react';
import Select from '../Forms/Select';
import { type ProductReview } from '../../types/marketplace';
import './Products.css';

const mockReviews = [
  { id: 1, author: 'Jane Doe', rating: 5, comment: 'Absolutely stunning piece! The quality is top-notch and it looks perfect in my living room.' },
  { id: 2, author: 'John Smith', rating: 4, comment: 'Very happy with this purchase. It was a bit smaller than I expected, but the craftsmanship is excellent.' },
];

interface ProductReviewsProps {
  productSlug?: string;
  productId: string;
  reviews: ProductReview[];
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews }) => {
  const [rating, setRating] = useState('5');

  const ratingOptions = [
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
  ];

  return (
    <div className="reviews-section">
      <h3>Customer Reviews</h3>
      <div className="reviews-list">
        {(reviews.length > 0 ? reviews : mockReviews).map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <span className="review-author">
                {'reviewer_name' in review ? review.reviewer_name : (review as any).author}
              </span>
              <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p className="review-comment">
              {'comment' in review ? review.comment : (review as any).comment}
            </p>
          </div>
        ))}
      </div>
      <div className="review-form-container">
        <h4>Leave a Review</h4>
        <form className="review-form">
          <div className="form-group">
            <label>Rating</label>
            <Select
              options={ratingOptions}
              value={rating}
              onChange={setRating}
            />
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea rows={4} className="form-control"></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Submit Review</button>
        </form>
      </div>
    </div>
  );
};

export default ProductReviews;