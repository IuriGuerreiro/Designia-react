import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout/Layout';
import ProductCard from './ProductCard';
import { useFavorites } from '@/features/marketplace/hooks/useFavorites';
import { useCart } from '@/shared/state/CartContext';

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
      <Layout>
        <div className="favorites-page">
          <div className="loading-message">
            <p>{t('favorites.loading_favorites')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="favorites-page">
        <div className="page-header">
          <h1>{t('favorites.my_favorites')}</h1>
          <p>{t('favorites.subtitle')}</p>
        </div>

        {error && (
          <div className="error-message">
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
          <div className="favorites-container">
            <div className="favorites-count">
              <p>{t('favorites.total_count', { count: favorites.length })}</p>
              <button 
                onClick={refreshFavorites}
                className="btn btn-secondary btn-small"
                disabled={loading}
              >
                {t('common.refresh')}
              </button>
            </div>

            <div className="products-grid">
              {favorites.map(({ product }) => (
                <div key={product.id} className="favorite-item">
                  <ProductCard 
                    product={product} 
                    onAddToCart={() => handleAddToCart(product)} 
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                  <div className="favorite-actions">
                    <button 
                      onClick={() => handleRemoveFromFavorites(product.slug)}
                      className="btn btn-danger btn-small"
                      disabled={loading}
                    >
                      {t('favorites.remove_from_favorites')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-favorites">
            <div className="empty-state">
              <h3>{t('favorites.no_favorites_title')}</h3>
              <p>{t('favorites.no_favorites_message')}</p>
              <a href="/products" className="btn btn-primary">
                {t('favorites.browse_products')}
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;