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
      <section className={styles.page}>
        <div className={styles.hero} role="img" aria-labelledby="not-found-heading">
          <div className={styles.heroContent}>
            <span className={styles.badge}>{t('notFound.badge', 'Designia navigation')}</span>
            <p className={styles.statusCode} aria-hidden="true">
              404
            </p>
            <h1 id="not-found-heading" className={styles.title}>
              {t('notFound.title', 'Page Not Found')}
            </h1>
            <p className={styles.lead}>
              {t(
                'notFound.description',
                "We couldn't locate that destination, but the monochrome collection is still within reach."
              )}
            </p>
            <div className={styles.actions}>
              <Link to="/" className={`btn btn-primary ${styles.primaryAction}`}>
                {t('notFound.home', 'Return home')}
              </Link>
              <button
                type="button"
                onClick={handleGoBack}
                className={`btn btn-secondary ${styles.secondaryAction}`}
              >
                {t('notFound.back', 'Go back to previous page')}
              </button>
            </div>
          </div>
        </div>

        <section className={styles.sections} aria-labelledby="not-found-suggestions">
          <h2 id="not-found-suggestions" className={styles.suggestionsHeader}>
            {t('notFound.suggestions.title', 'Explore our curated paths')}
          </h2>
          <p className={styles.suggestionsLead}>
            {t(
              'notFound.descriptionExtended',
              'Choose a destination below to continue browsing our marketplace experiences.'
            )}
          </p>

          <div className={styles.suggestionsGrid}>
            <Link to="/products" className={styles.suggestionCard}>
              <span className={styles.suggestionIcon} aria-hidden="true">
                🛍️
              </span>
              <div>
                <h3 className={styles.suggestionTitle}>
                  {t('notFound.suggestions.products', 'Browse products')}
                </h3>
                <p className={styles.suggestionCopy}>
                  {t(
                    'notFound.suggestions.productsDesc',
                    'Discover monochrome statement pieces tailored for modern spaces.'
                  )}
                </p>
              </div>
            </Link>

            <Link to="/favorites" className={styles.suggestionCard}>
              <span className={styles.suggestionIcon} aria-hidden="true">
                ❤️
              </span>
              <div>
                <h3 className={styles.suggestionTitle}>
                  {t('notFound.suggestions.favorites', 'View favorites')}
                </h3>
                <p className={styles.suggestionCopy}>
                  {t(
                    'notFound.suggestions.favoritesDesc',
                    'Revisit the textures and silhouettes you saved for later.'
                  )}
                </p>
              </div>
            </Link>

            <Link to="/cart" className={styles.suggestionCard}>
              <span className={styles.suggestionIcon} aria-hidden="true">
                🛒
              </span>
              <div>
                <h3 className={styles.suggestionTitle}>
                  {t('notFound.suggestions.cart', 'Review your cart')}
                </h3>
                <p className={styles.suggestionCopy}>
                  {t('notFound.suggestions.cartDesc', 'Adjust quantities or finalize your selections.')}
                </p>
              </div>
            </Link>

            <Link to="/my-orders" className={styles.suggestionCard}>
              <span className={styles.suggestionIcon} aria-hidden="true">
                📦
              </span>
              <div>
                <h3 className={styles.suggestionTitle}>
                  {t('notFound.suggestions.orders', 'Track your orders')}
                </h3>
                <p className={styles.suggestionCopy}>
                  {t(
                    'notFound.suggestions.ordersDesc',
                    'Monitor statuses, confirm deliveries, and revisit previous purchases.'
                  )}
                </p>
              </div>
            </Link>
          </div>
        </section>
      </section>
    </Layout>
  );
};

export default NotFound;
