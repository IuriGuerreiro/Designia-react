import { Layout } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout>
      <section className={styles.page}>
        <div className={styles.card} aria-labelledby="nf-title">
          <div className={styles.badgeRow}>
            <span className={styles.badge}>{t('notFound.badge', 'Designia')}</span>
          </div>

          <div className={styles.codeRow} aria-hidden="true">404</div>

          <h1 id="nf-title" className={styles.title}>
            {t('notFound.title', 'Page not found')}
          </h1>
          <p className={styles.subtitle}>
            {t(
              'notFound.description',
              'We can’t find the page you’re looking for. Try one of these destinations.'
            )}
          </p>

          <div className={styles.actions}>
            <Link to="/" className={`btn btn-primary ${styles.primary}`}>
              {t('notFound.home', 'Go to homepage')}
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`btn btn-secondary ${styles.secondary}`}
            >
              {t('notFound.back', 'Go back')}
            </button>
          </div>
        </div>

        <div className={styles.links} aria-labelledby="nf-links">
          <h2 id="nf-links" className={styles.linksTitle}>
            {t('notFound.suggestions.title', 'Popular paths')}
          </h2>
          <div className={styles.grid}>
            <Link to="/products" className={styles.linkCard}>
              <span className={styles.icon}>🛍️</span>
              <div>
                <div className={styles.linkTitle}>{t('notFound.suggestions.products', 'Browse products')}</div>
                <div className={styles.linkCopy}>{t('notFound.suggestions.productsDesc', 'Discover pieces for your space')}</div>
              </div>
            </Link>
            <Link to="/favorites" className={styles.linkCard}>
              <span className={styles.icon}>❤️</span>
              <div>
                <div className={styles.linkTitle}>{t('notFound.suggestions.favorites', 'View favorites')}</div>
                <div className={styles.linkCopy}>{t('notFound.suggestions.favoritesDesc', 'Revisit saved items')}</div>
              </div>
            </Link>
            <Link to="/cart" className={styles.linkCard}>
              <span className={styles.icon}>🛒</span>
              <div>
                <div className={styles.linkTitle}>{t('notFound.suggestions.cart', 'Review your cart')}</div>
                <div className={styles.linkCopy}>{t('notFound.suggestions.cartDesc', 'Edit or checkout')}</div>
              </div>
            </Link>
            <Link to="/my-orders" className={styles.linkCard}>
              <span className={styles.icon}>📦</span>
              <div>
                <div className={styles.linkTitle}>{t('notFound.suggestions.orders', 'Track orders')}</div>
                <div className={styles.linkCopy}>{t('notFound.suggestions.ordersDesc', 'See delivery status')}</div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
