import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';
import { useTranslation } from 'react-i18next';
import { productService, favoriteService } from '../../services';
import { type ProductListItem } from '../../types/marketplace';

// Compatibility type for different product data formats
interface ProductCardProps {
  product: ProductListItem | {
    id: number | string;
    name: string;
    price: string | number;
    imageUrl?: string;
    colors?: string[];
    category?: string;
    rating?: number;
    reviewCount?: number;
    isBestSeller?: boolean;
    // Add marketplace service properties as optional
    slug?: string;
    seller?: { username: string };
    primary_image?: { image: string; alt_text: string };
    is_favorited?: boolean;
    is_featured?: boolean;
    is_on_sale?: boolean;
    discount_percentage?: number;
    original_price?: number;
    is_in_stock?: boolean;
    average_rating?: number;
    review_count?: number;
    condition?: string;
  };
  onAddToCart: () => void;
  onFavoriteToggle?: (productId: string, favorited: boolean) => void;
}

const StarRating: React.FC<{ rating: number; reviewCount: number }> = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="star-rating">
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>★</span>)}
      {halfStar && <span className="half-star">★</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="empty-star">★</span>)}
      <span className="review-count">({reviewCount})</span>
    </div>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onFavoriteToggle }) => {
  const { t } = useTranslation();
  
  // Handle different product data formats
  const isApiProduct = 'slug' in product;
  const productId = typeof product.id === 'string' ? product.id : product.id.toString();
  const productSlug = isApiProduct ? product.slug : productId;
  
  const [isFavorited, setIsFavorited] = useState(product.is_favorited || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart();
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isApiProduct || !product.slug) return;
    
    setIsLoading(true);
    try {
      const response = await favoriteService.toggleFavorite(product.slug);
      setIsFavorited(response.favorited);
      onFavoriteToggle?.(productId, response.favorited);
      
      // Provide user feedback
      console.log(response.favorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      
      // Handle authentication error
      if (error instanceof Error && error.message.includes('401')) {
        alert('Please log in to add products to favorites');
        // Could redirect to login or show login modal
      } else {
        alert('Failed to update favorites. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    if (!isApiProduct || !product.slug) return;
    
    try {
      await productService.trackClick(product.slug);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  // Handle different data formats
  const primaryImage = product.primary_image?.image || (product as any).imageUrl || '/placeholder-product.png';
  const displayPrice = product.price.toString();
  const originalPrice = product.original_price?.toString();
  const rating = product.average_rating || (product as any).rating || 0;
  const reviewCount = product.review_count || (product as any).reviewCount || 0;
  const isFeatured = product.is_featured || (product as any).isBestSeller || false;
  const isOnSale = product.is_on_sale || false;
  const discountPercentage = product.discount_percentage || 0;
  const isInStock = product.is_in_stock !== undefined ? product.is_in_stock : true;
  const sellerName = product.seller?.username || 'Unknown';
  const condition = product.condition || 'new';

  return (
    <div className="product-card-link">
      <div className="product-card">
        <div className="product-card-badges">
          {isFeatured && <div className="badge bestseller-badge">{t('products.featured_badge')}</div>}
          {isOnSale && (
            <div className="badge sale-badge">
              -{discountPercentage}%
            </div>
          )}
        </div>
        
        <Link to={`/products/${productSlug}`} onClick={handleClick} className="product-image-link">
          <div className="product-image-container">
            <img 
              src={primaryImage} 
              alt={product.primary_image?.alt_text || product.name} 
              className="product-image" 
            />
            
            {/* Favorite button overlay on image */}
            {isApiProduct && (
              <button 
                className={`favorite-btn favorite-btn-overlay ${isFavorited ? 'favorited' : ''}`}
                onClick={handleFavoriteClick}
                disabled={isLoading}
                aria-label={isFavorited ? t('products.remove_from_favorites') : t('products.add_to_favorites')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={isFavorited ? "#ff4757" : "none"}
                    stroke={isFavorited ? "#ff4757" : "#999"}
                    strokeWidth="2"
                  />
                </svg>
              </button>
            )}
            
            {!isInStock && (
              <div className="out-of-stock-overlay">
                <span>{t('products.out_of_stock')}</span>
              </div>
            )}
          </div>
        </Link>

        <div className="product-info">
          <div className="product-meta-top">
            <span className="product-seller">
              {t('products.sold_by')} <strong>{sellerName}</strong>
            </span>
            {condition !== 'new' && (
              <span className="condition-badge">{t(`products.form.conditions.${condition}`)}</span>
            )}
          </div>

          <Link to={`/products/${productSlug}`} className="product-name-link" onClick={handleClick}>
            <h4 className="product-name">{product.name}</h4>
          </Link>
          
          <div className="product-rating">
            {reviewCount > 0 ? (
              <StarRating rating={rating} reviewCount={reviewCount} />
            ) : (
              <span className="no-reviews">{t('products.no_reviews')}</span>
            )}
          </div>
          
          <div className="product-pricing">
            <span className="current-price">${displayPrice}</span>
            {originalPrice && isOnSale && (
              <span className="original-price">${originalPrice}</span>
            )}
          </div>

          <p className="shipping-info">{t('products.shipping_info')}</p>
          
          <div className="product-actions">
            <button 
              className="btn btn-primary add-to-cart-btn" 
              onClick={handleAddToCartClick}
              disabled={!isInStock}
            >
              {isInStock ? t('products.add_to_cart_button') : t('products.out_of_stock')}
            </button>
            
            {isApiProduct && (
              <button 
                className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={handleFavoriteClick}
                disabled={isLoading}
                aria-label={isFavorited ? t('products.remove_from_favorites') : t('products.add_to_favorites')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={isFavorited ? "#ff4757" : "none"}
                    stroke={isFavorited ? "#ff4757" : "#999"}
                    strokeWidth="2"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;