import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { productService } from '@/features/marketplace/api';
import { type ProductListItem } from '@/features/marketplace/model';
import ProductCard from './ProductCard';
import styles from './MyProducts.module.css';

const MyProductsPage: React.FC = () => {
  const { t } = useTranslation();
  
  // State management
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Load user's products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const userProducts = await productService.getMyProducts();
        console.log('User products loaded:', userProducts);
        setProducts(userProducts);
      } catch (err) {
        console.error('Failed to load user products:', err);
        setError(t('products.errors.load_my_products') || '');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleDelete = async (productId: string, productSlug: string) => {
    if (!window.confirm(t('products.prompts.confirm_delete') || '')) {
      return;
    }

    try {
      await productService.deleteProduct(productSlug);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(t('products.errors.delete_failed') || '');
    }
  };

  // Product filtering logic
  const activeProducts = products.filter(p => p.is_active).length;
  const inactiveProducts = products.filter(p => !p.is_active).length;
  const featuredProducts = products.filter(p => p.is_featured).length;
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;

  // Filter products based on active filter
  const getFilteredProducts = () => {
    switch (activeFilter) {
      case 'active':
        return products.filter(p => p.is_active);
      case 'inactive':
        return products.filter(p => !p.is_active);
      case 'featured':
        return products.filter(p => p.is_featured);
      case 'lowStock':
        return products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
      case 'outOfStock':
        return products.filter(p => p.stock_quantity === 0);
      default:
        return products;
    }
  };

  const filteredProducts = getFilteredProducts();

  if (loading) {
    return (
    <Layout maxWidth="full">
      <div className={styles['my-products-page']}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Hero Section Skeleton */}
            <div className={`${styles['hero-section']} ${styles['skeleton']}`}>
              <div className={`${styles['hero-title']} ${styles['skeleton-text']}`}></div>
              <div className={`${styles['hero-subtitle']} ${styles['skeleton-text']}`}></div>
            </div>

            {/* Products Overview Box Skeleton */}
            <div className={`${styles['products-overview-box']} ${styles['skeleton']}`}>
              <div className={`${styles['overview-header']} ${styles['skeleton']}`}>
                <div className={`${styles['overview-title']} ${styles['skeleton-text']}`}></div>
                <div className={`${styles['overview-actions']} ${styles['skeleton']}`}>
                  <div className={`${styles['add-product-btn']} ${styles['skeleton-button']}`}></div>

                </div>
              </div>
              
              <div className={`${styles['overview-stats']} ${styles['skeleton']}`}>
                {[...Array(6)].map((_, index) => (
                  <div key={index} className={`${styles['stat-item']} ${styles['skeleton']}`}>
                    <div className={`${styles['stat-number']} ${styles['skeleton-text']}`}></div>
                    <div className={`${styles['stat-label']} ${styles['skeleton-text']}`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className={`${styles['products-section']} ${styles['skeleton']}`}>
              <div className={`${styles['products-header']} ${styles['skeleton']}`}>
                <div className={`${styles['section-title']} ${styles['skeleton-text']}`}></div>
                <div className={`${styles['products-summary']} ${styles['skeleton-text']}`}></div>
              </div>
              
              <div className={`${styles['products-grid']} ${styles['skeleton']}`}>
                {[...Array(6)].map((_, index) => (
                  <div key={index} className={styles['product-card-skeleton']}>
                    <div className={`${styles['product-image']} ${styles['skeleton-image']}`}></div>
                    <div className={`${styles['product-info']} ${styles['skeleton']}`}>
                      <div className={`${styles['product-name']} ${styles['skeleton-text']}`}></div>
                      <div className={`${styles['product-price']} ${styles['skeleton-text']}`}></div>
                      <div className={`${styles['product-actions']} ${styles['skeleton']}`}>
                        <div className={`${styles['action-btn']} ${styles['skeleton-button']}`}></div>
                        <div className={`${styles['action-btn']} ${styles['skeleton-button']}`}></div>
                        <div className={`${styles['action-btn']} ${styles['skeleton-button']}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="full">
  <div className={styles['my-products-page']}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Hero Section - Like MyOrdersPage.tsx */}
          <div className={styles['hero-section']}>
            <h1 className={styles['hero-title']}>{t('products.my_products_title')}</h1>
            <p className={styles['hero-subtitle']}>Manage your product portfolio with powerful tools and insights</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles['error-banner']}>
              <div className={styles['error-content']}>
                <div className={styles['error-icon']}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div className={styles['error-text']}>
          <h4>{t('products.errors.load_my_products_title') || 'Failed to Load Products'}</h4>
                  <p>{error}</p>
                </div>
                <button className={styles['retry-btn']} onClick={() => window.location.reload()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4V10H7M23 20V14H17"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14"/>
                  </svg>
                  {t('orders.actions.try_again')}
                </button>
              </div>
            </div>
          )}

          <div className={styles['products-overview-box']}>
            <div className={styles['overview-header']}>
              <h2 className={styles['overview-title']}>{t('products.my_products_title')}</h2>
              <div className={styles['overview-actions']}>
                <Link to="/products/new" className={styles['add-product-btn']}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5V19M5 12H19"/>
                  </svg>
                  {t('products.add_new_product')}
                </Link>
              </div>
            </div>
            
            <div className={styles['overview-stats']}>
              <div 
                className={`${styles['stat-item']} ${activeFilter === 'all' ? styles['active'] : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <span className={styles['stat-number']}>{products.length}</span>
                <span className={styles['stat-label']}>{t('products.my_products_title')}</span>
              </div>
              <div 
                className={`${styles['stat-item']} ${activeFilter === 'active' ? styles['active'] : ''}`}
                onClick={() => setActiveFilter('active')}
              >
                <span className={styles['stat-number']}>{activeProducts}</span>
                <span className={styles['stat-label']}>{t('products.status.active') || 'Active'}</span>
              </div>
              <div 
                className={`${styles['stat-item']} ${activeFilter === 'lowStock' ? styles['active'] : ''}`}
                onClick={() => setActiveFilter('lowStock')}
              >
                <span className={styles['stat-number']}>{lowStockProducts}</span>
                <span className={styles['stat-label']}>{t('products.low_stock')}</span>
              </div>
              <div 
                className={`${styles['stat-item']} ${activeFilter === 'outOfStock' ? styles['active'] : ''}`}
                onClick={() => setActiveFilter('outOfStock')}
              >
                <span className={styles['stat-number']}>{outOfStockProducts}</span>
                <span className={styles['stat-label']}>{t('products.out_of_stock')}</span>
              </div>
              <div 
                className={`${styles['stat-item']} ${activeFilter === 'featured' ? styles['active'] : ''}`}
                onClick={() => setActiveFilter('featured')}
              >
                <span className={styles['stat-number']}>{featuredProducts}</span>
                <span className={styles['stat-label']}>{t('products.featured_badge')}</span>
              </div>
              <div 
                className={`${styles['stat-item']} ${activeFilter === 'inactive' ? styles['active'] : ''}`}
                onClick={() => setActiveFilter('inactive')}
              >
                <span className={styles['stat-number']}>{inactiveProducts}</span>
                <span className={styles['stat-label']}>{t('products.inactive')}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Products Content */}
        {filteredProducts.length > 0 ? (
          <div className={styles['my-products-content']}>
            {/* Products Grid/List */}
            <div className={styles['products-section']}>
              <div className={styles['products-header']}>
                <h3 className={styles['section-title']}>
                  {activeFilter === 'all' ? t('products.my_products_title') : 
                   activeFilter === 'active' ? t('products.status.active') + ' ' + t('products.my_products_title') :
                   activeFilter === 'inactive' ? t('products.inactive') + ' ' + t('products.my_products_title') :
                   activeFilter === 'featured' ? t('products.featured_badge') + ' ' + t('products.my_products_title') :
                   activeFilter === 'lowStock' ? t('products.low_stock') + ' ' + t('products.my_products_title') :
                   t('products.out_of_stock') + ' ' + t('products.my_products_title')}
                </h3>
                <div className={styles['products-summary']}>
                  <span className={styles['summary-text']}>
                    {t('orders.count_showing', { shown: filteredProducts.length, total: products.length })}
                    {activeFilter !== 'all' && (
                      <span className={styles['filter-indicator']}>
                        {' '}({activeFilter === 'active' ? t('products.status.active') : 
                              activeFilter === 'inactive' ? t('products.inactive') : 
                              activeFilter === 'featured' ? t('products.featured_badge') : 
                              activeFilter === 'lowStock' ? t('products.low_stock') : 
                              t('products.out_of_stock')} {t('products.filter') || 'filter'})
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className={`${styles['products-layout']} ${styles['products-grid']}`}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    displayMode="owner"
                    onAddToCart={() => {}} // Empty function for owner mode
                    onFavoriteToggle={() => {}} // Empty function for owner mode
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles['empty-state']}>
            <div className={styles['empty-content']}>
              <div className={styles['empty-icon']}>
                {activeFilter === 'all' ? (
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 7L10 17L5 12"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                  </svg>
                ) : (
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"/>
                  </svg>
                )}
              </div>
              <h3 className={styles['empty-title']}>
                {activeFilter === 'all' ? t('products.empty_no_products_yet') || 'No Products Yet' : t('products.empty_no_products_found') || 'No Products Found'}
              </h3>
              <p className={styles['empty-description']}>
                {activeFilter === 'all' 
                  ? t('products.empty_add_first') || ''
                  : t('products.empty_no_match', { filter: activeFilter })
                }
              </p>
              <div className={styles['empty-actions']}>
                {activeFilter === 'all' ? (
                  <>
                    <Link to="/products/new" className={`${styles['empty-btn']} ${styles['primary']}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5V19M5 12H19"/>
                      </svg>
                      {t('products.add_first_product')}
                    </Link>
                    <Link to="/products" className={`${styles['empty-btn']} ${styles['secondary']}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3V21H21"/>
                        <path d="M9 9L12 6L16 10L20 6"/>
                      </svg>
                      {t('favorites.browse_products')}
                    </Link>
                  </>
                ) : (
                  <button 
                    className={`${styles['empty-btn']} ${styles['primary']}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3V21H21"/>
                      <path d="M9 9L12 6L16 10L20 6"/>
                    </svg>
                    {t('products.show_all_products') || 'Show All Products'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProductsPage;
