import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../Layout/Layout';
import './NotFound.css';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <div className="products-page">
        <div className="products-header">
          <h2>{t('notFound.title', 'Page Not Found')}</h2>
        </div>

        <div className="not-found-message">
          <div className="error-illustration">
            <div className="error-code">404</div>
            <div className="error-description">
              <p>{t('notFound.description', 'Sorry, the page you are looking for doesn\'t exist or has been moved.')}</p>
            </div>
          </div>

          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">
              {t('notFound.home', 'Go to Homepage')}
            </Link>
            <button onClick={handleGoBack} className="btn btn-secondary">
              {t('notFound.back', 'Go Back')}
            </button>
          </div>
        </div>

        <div className="not-found-suggestions">
          <h3>{t('notFound.suggestions.title', 'What would you like to do?')}</h3>
          <div className="suggestions-grid">
            <Link to="/products" className="suggestion-card">
              <div className="suggestion-icon">🛍️</div>
              <div className="suggestion-content">
                <h4>{t('notFound.suggestions.products', 'Browse Products')}</h4>
                <p>{t('notFound.suggestions.productsDesc', 'Discover amazing products from our marketplace')}</p>
              </div>
            </Link>
            
            <Link to="/favorites" className="suggestion-card">
              <div className="suggestion-icon">❤️</div>
              <div className="suggestion-content">
                <h4>{t('notFound.suggestions.favorites', 'View Favorites')}</h4>
                <p>{t('notFound.suggestions.favoritesDesc', 'Check out your saved favorite items')}</p>
              </div>
            </Link>
            
            <Link to="/cart" className="suggestion-card">
              <div className="suggestion-icon">🛒</div>
              <div className="suggestion-content">
                <h4>{t('notFound.suggestions.cart', 'Shopping Cart')}</h4>
                <p>{t('notFound.suggestions.cartDesc', 'Review items in your cart')}</p>
              </div>
            </Link>
            
            <Link to="/my-orders" className="suggestion-card">
              <div className="suggestion-icon">📦</div>
              <div className="suggestion-content">
                <h4>{t('notFound.suggestions.orders', 'My Orders')}</h4>
                <p>{t('notFound.suggestions.ordersDesc', 'Track your order history and status')}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;