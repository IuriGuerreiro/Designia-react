import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/app/layout';
import ProductCard from './ProductCard';
import { useFavorites } from '@/features/marketplace/hooks/useFavorites';
import { useCart } from '@/shared/state/CartContext';
import styles from './ProductList.module.css';

const FavoritesPage: React.FC = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { 
    favorites, 
    loading, 
    error, 
    refreshFavorites, 
    toggleFavorite 
  } = useFavorites();

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const handleAddToCart = (product: any) => {
    // Enhanced image URL resolution with presigned URL priority
    let imageUrl = '/placeholder-product.png';
    
    if (product.primary_image) {
      // Use display_url if available (from automatic assimilation)
      if (product.primary_image.display_url) {
        imageUrl = product.primary_image.display_url;
      }
      // Fallback to manual resolution if display_url not available
      else if (product.primary_image.presigned_url && product.primary_image.presigned_url !== 'null' && product.primary_image.presigned_url !== null) {
        imageUrl = product.primary_image.presigned_url;
      } else if (product.primary_image.image_url && product.primary_image.image_url !== 'null' && product.primary_image.image_url !== null) {
        imageUrl = product.primary_image.image_url;
      } else if (product.primary_image.image && product.primary_image.image !== 'null' && product.primary_image.image !== null) {
        imageUrl = product.primary_image.image;
      }
    }
    
    console.log('=== FAVORITES PAGE - ADD TO CART IMAGE DEBUG ===');
    console.log('Product:', product.name);
    console.log('Primary image data:', product.primary_image);
    console.log('Selected imageUrl:', imageUrl);
    console.log('URL source:', product.primary_image?.url_source || 'manual_fallback');
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? product.price : product.price.toString(),
      imageUrl: imageUrl,
      quantity: 1,
      slug: product.slug
    };
    addToCart(cartItem);
  };

  const handleFavoriteToggle = async (productId: string, favorited: boolean) => {
    // The useFavorites hook will handle the state update
    // This callback is for consistency with ProductCard interface
    console.log(`Product ${productId} favorite status: ${favorited}`);
  };

  const handleRemoveFromFavorites = async (productSlug: string) => {
    try {
      await toggleFavorite(productSlug);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <Layout maxWidth="full">
        <div className={styles['products-page']}>
          <div className={styles['error-message']}>
            <p>{t('favorites.loading_favorites')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="full">
      <div className={`${styles['products-page']} ${styles['favorites-wide']}`}>
        <section className={styles['products-main']}>
          <div className={styles['products-controls']}>
            <div className={styles['results-info']}>
              <span>{t('favorites.my_favorites')}</span>
              <span className={styles['results-filters']}>{t('favorites.total_count', { count: favorites.length })}</span>
            </div>
            <button 
              onClick={refreshFavorites}
              className={styles['filter-toggle-btn']}
              disabled={loading}
              type="button"
            >
              {t('common.refresh')}
            </button>
          </div>
        </section>

        {error && (
          <div className={styles['error-message']}>
            <p>{error}</p>
            {error.includes('Authentication') && (
              <button 
                onClick={() => window.location.href = '/login'}
                className="btn btn-primary"
              >
                {t('auth.login_button')}
              </button>
            )}
          </div>
        )}

        {favorites.length > 0 ? (
          <div className={styles['products-flex']}>
            {favorites.map(({ product }) => (
              <ProductCard 
                key={product.id}
                product={product} 
                onAddToCart={() => handleAddToCart(product)} 
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className={styles['no-results-message']}>
            <div className={styles['no-results-icon']}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>{t('favorites.no_favorites_title')}</h3>
            <p>{t('favorites.no_favorites_message')}</p>
            <a href="/products" className={styles['retry-btn']} style={{textDecoration: 'none', display: 'inline-block'}}>
              {t('favorites.browse_products')}
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
