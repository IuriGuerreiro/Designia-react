import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../Layout/Layout';
import ProductCard from './ProductCard';
import { useFavorites } from '../../hooks/useFavorites';
import { useCart } from '../../contexts/CartContext';
import './Products.css';

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
    const cartItem = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? product.price : product.price.toString(),
      imageUrl: product.primary_image?.image || '/placeholder-product.png',
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