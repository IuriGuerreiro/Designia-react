import { Layout } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>{t('notFound.title', 'Page Not Found')}</h2>
          <p className={styles.description}>
            {t('notFound.description', "Sorry, the page you are looking for doesn't exist or has been moved.")}
          </p>
        </header>

        <section className={styles.illustration} aria-live="polite">
          <span className={styles.statusCode} aria-hidden="true">
            404
          </span>
          <div>
            <p className={styles.description}>
              {t('notFound.descriptionExtended', 'Let\'s get you back to discovering beautiful designs.')}
            </p>
          </div>
          <div className={styles.actions}>
            <Link to="/" className="btn btn-primary">
              {t('notFound.home', 'Go to Homepage')}
            </Link>
            <button type="button" onClick={handleGoBack} className="btn btn-secondary">
              {t('notFound.back', 'Go Back')}
            </button>
          </div>
        </section>

        <section className={styles.suggestions} aria-labelledby="not-found-suggestions">
          <h3 id="not-found-suggestions" className={styles.suggestionsHeader}>
            {t('notFound.suggestions.title', 'What would you like to do?')}
          </h3>
          <div className={styles.suggestionsGrid}>
            <Link to="/products" className={styles.suggestionCard}>
              <span className={styles.suggestionIcon} aria-hidden="true">🛍️</span>
              <div>
                <h4 className={styles.suggestionTitle}>
                  {t('notFound.suggestions.products', 'Browse Products')}
                </h4>
                <p className={styles.suggestionCopy}>
                  {t('notFound.suggestions.productsDesc', 'Discover amazing products from our marketplace')}
                </p>
              </div>
            </Link>

            <Link to="/favorites" className={styles.suggestionCard}>
              <span className={styles.suggestionIcon} aria-hidden="true">❤️</span>
              <div>
                <h4 className={styles.suggestionTitle}>
                  {t('notFound.suggestions.favorites', 'View Favorites')}
                </h4>
                <p className={styles.suggestionCopy}>
                  {t('notFound.suggestions.favoritesDesc', 'Check out your saved favorite items')}
                </p>
              </div>
            </Link>

            <Link to="/cart" className={styles.suggestionCard}>
              <span className={styles.suggestionIcon} aria-hidden="true">🛒</span>
              <div>
                <h4 className={styles.suggestionTitle}>
                  {t('notFound.suggestions.cart', 'Shopping Cart')}
                </h4>
                <p className={styles.suggestionCopy}>
                  {t('notFound.suggestions.cartDesc', 'Review items in your cart')}
                </p>
              </div>
            </Link>

            <Link to="/my-orders" className={styles.suggestionCard}>
              <span className={styles.suggestionIcon} aria-hidden="true">📦</span>
              <div>
                <h4 className={styles.suggestionTitle}>
                  {t('notFound.suggestions.orders', 'My Orders')}
                </h4>
                <p className={styles.suggestionCopy}>
                  {t('notFound.suggestions.ordersDesc', 'Track your order history and status')}
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default NotFound;
