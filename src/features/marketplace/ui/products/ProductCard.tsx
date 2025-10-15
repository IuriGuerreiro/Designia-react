import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { useTranslation } from 'react-i18next';
import { favoriteService, productService } from '@/features/marketplace/api';
import { type ProductListItem } from '@/features/marketplace/model';

interface ProductCardProps {
  product: ProductListItem;
  onAddToCart: () => void;
  onFavoriteToggle?: (productId: string, favorited: boolean) => void;
  displayMode?: 'customer' | 'owner';
  onDelete?: (productId: string, productSlug: string) => void;
}

const FavoriteIcon: React.FC<{ isFavorited: boolean }> = ({ isFavorited }) => (
  <svg 
    width="22" 
    height="22" 
    viewBox="0 0 24 24" 
    fill={isFavorited ? '#EF4444' : 'none'} 
    stroke={isFavorited ? '#EF4444' : '#6B7280'} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={styles.favoriteIcon}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onFavoriteToggle, displayMode = 'customer', onDelete }) => {
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = useState(product.is_favorited || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      const response = await favoriteService.toggleFavorite(product.slug);
      setIsFavorited(response.favorited);
      onFavoriteToggle?.(product.id, response.favorited);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTrackClick = () => {
    productService.trackClick(product.slug).catch(err => console.error(err));
  };

  const primaryImage = product.primary_image?.presigned_url || '/placeholder-product.png';

  return (
    <div className={`${styles.card} ${product.is_featured ? styles.premiumCard : ''}`}>
      <Link to={`/products/${product.slug}`} className={styles.imageLink} onClick={handleTrackClick}>
        <div className={styles.imageContainer}>
          <img src={primaryImage} alt={product.name} className={styles.image} />
          {!product.is_in_stock && (
            <div className={styles.outOfStockOverlay}>
              <span>Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className={styles.badges}>
          {product.is_featured && (
            <div className={`${styles.badge} ${styles.premiumBadge}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
              </svg>
              {t('products.featured_badge')}
            </div>
          )}
          {product.is_on_sale && (
            <div className={`${styles.badge} ${styles.saleBadge}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 7H21L19 12H7.5L8.5 9H9M7 15H19L17 20H5.5L6.5 17H7M3 3H5L5.4 5M7 13H17L19 7H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 7 17V13H17Z"/>
              </svg>
              -{product.discount_percentage}% OFF
            </div>
          )}
          {displayMode === 'owner' && !product.is_active && (
            <div className={`${styles.badge} ${styles.inactiveBadge}`}>
              Inactive
            </div>
          )}
          {displayMode === 'owner' && product.stock_quantity === 0 && (
            <div className={`${styles.badge} ${styles.outOfStockBadge}`}>
              Out of Stock
            </div>
          )}
          {displayMode === 'owner' && product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <div className={`${styles.badge} ${styles.lowStockBadge}`}>
              Low Stock
            </div>
          )}
        </div>
        
        <button 
          className={`${styles.favoriteBtn} ${isFavorited ? styles.favorited : ''} ${isLoading ? styles.loading : ''}`}
          onClick={handleFavoriteClick}
          disabled={isLoading}
          aria-label={t(isFavorited ? 'products.remove_from_favorites' : 'products.add_to_favorites')}
        >
          <FavoriteIcon isFavorited={isFavorited} />
        </button>
      </Link>
      
      <div className={styles.info}>
        {product.seller?.id ? (
          <Link to={`/seller/${product.seller.id}`} className={styles.seller}>
            {product.seller.username}
          </Link>
        ) : (
          <div className={styles.seller}>Designia</div>
        )}

        <Link to={`/products/${product.slug}`} className={styles.nameLink} onClick={handleTrackClick}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>
        
        {product.average_rating > 0 && (
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill={star <= product.average_rating ? "#F59E0B" : "none"}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                >
                  <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
                </svg>
              ))}
            </div>
            <span className={styles.ratingText}>({product.review_count})</span>
          </div>
        )}
        
        <div className={styles.pricing}>
          <span className={styles.currentPrice}>${product.price}</span>
          {product.is_on_sale && product.original_price && (
            <span className={styles.originalPrice}>${product.original_price}</span>
          )}
        </div>

        <div className={styles.cardActions}>
          {displayMode === 'customer' ? (
            <>
              <button 
                className={`${styles.addToCartBtn} ${!product.is_in_stock ? styles.disabled : ''}`}
                onClick={onAddToCart}
                disabled={!product.is_in_stock}
              >
                {product.is_in_stock ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 7 17V13H17Z"/>
                    </svg>
                    {t('products.add_to_cart_button')}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18.364 18.364A9 9 0 1 1 5.636 5.636a9 9 0 0 1 12.728 12.728zM12 8v4m0 4h.01"/>
                    </svg>
                    {t('products.out_of_stock')}
                  </>
                )}
              </button>
              
              {product.is_in_stock && product.stock_quantity <= 5 && (
                <div className={styles.stockWarning}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                  </svg>
                  Only {product.stock_quantity} left
                </div>
              )}
            </>
          ) : (
            <>
              <button 
                className={`${styles.addToCartBtn} ${styles.ownerBtn}`}
                onClick={() => window.location.href = `/metrics/product/${product.slug}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3V21H21"/>
                  <path d="M9 9L12 6L16 10L20 6"/>
                </svg>
                Metrics
              </button>
              <button 
                className={`${styles.addToCartBtn} ${styles.ownerBtn}`}
                onClick={() => window.location.href = `/products/${product.slug}/edit`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"/>
                  <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"/>
                </svg>
                Edit
              </button>
              <button 
                className={`${styles.addToCartBtn} ${styles.ownerBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete && onDelete(product.id, product.slug)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6H5H21"/>
                  <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"/>
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
