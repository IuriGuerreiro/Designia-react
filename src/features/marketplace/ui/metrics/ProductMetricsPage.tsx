import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/app/layout';
import styles from './Metrics.module.css';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/state/AuthContext';
import { apiRequest } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/endpoints';

const ProductMetricsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { productId } = useParams<{ productId: string }>();
  
  // Product metrics data from API
  const [productMetrics, setProductMetrics] = useState({
    product_info: {
      id: '',
      name: '',
      slug: '',
      price: '0.00',
      stock_quantity: 0,
      is_active: false,
      created_at: '',
      primary_image: null,
      images: []
    },
    product_metrics: {
      total_views: 0,
      total_clicks: 0,
      total_favorites: 0,
      total_cart_additions: 0,
      total_sales: 0,
      total_revenue: '0.00',
    },
    product_counts: {
      total_products: 0,
      active_listings: 0,
      featured_products: 0,
      total_categories: 0,
    },
    recent_orders: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics from API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Use centralized endpoints and http client (handles auth + retries)
        const data = await apiRequest<any>(
          productId ? API_ENDPOINTS.PRODUCT_METRICS(productId) : API_ENDPOINTS.DASHBOARD_METRICS,
          { method: 'GET' }
        );
        setProductMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(t('orders.errors.unable_to_load'));
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [productId]);

  // Calculate conversion rates
  const ctr = productMetrics.product_metrics.total_views > 0 
    ? ((productMetrics.product_metrics.total_clicks / productMetrics.product_metrics.total_views) * 100).toFixed(2)
    : '0.00';
  const conversionRate = productMetrics.product_metrics.total_clicks > 0 
    ? ((productMetrics.product_metrics.total_sales / productMetrics.product_metrics.total_clicks) * 100).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <Layout>
        <div className={styles['metrics-page-container']}>
          <div className={styles['metrics-header']}>
            <h2>{t('metrics.loading_title')}</h2>
            <p>{t('metrics.loading_subtitle')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles['metrics-page-container']}>
          <div className={styles['metrics-header']}>
            <h2>{t('metrics.error_title')}</h2>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['metrics-page-container']}>
        <div className={styles['metrics-header']}>
          <h2>
            {productId
              ? t('metrics.product_analytics_title', { productName: productMetrics.product_info?.name || '...' })
              : t('metrics.seller_dashboard_title')}
          </h2>
          <p>{productId ? t('metrics.product_overview_subtitle') : t('metrics.seller_overview_subtitle')}</p>
        </div>

        {/* Product Info Section (only for individual product view) */}
        {productId && productMetrics.product_info?.name && (
          <div className={styles['product-info-section']}>
            <h3>{t('metrics.product_information')}</h3>
            
            {/* Product Image and Basic Info */}
            <div className={styles['product-summary-container']} style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' }}>
              {/* Product Image */}
              <div className={styles['product-image-container']} style={{ flexShrink: 0 }}>
                <img 
                  src={(() => {
                    // Enhanced image URL resolution with presigned URL priority
                    const primaryImage: any = productMetrics.product_info.primary_image || 
                                       (productMetrics.product_info.images && productMetrics.product_info.images[0]);
                    
                    let imageUrl = '/placeholder-product.png';
                    
                    if (primaryImage) {
                      // Use display_url if available (from automatic assimilation)
                      if (primaryImage.display_url) {
                        imageUrl = primaryImage.display_url;
                      }
                      // Fallback to manual resolution if display_url not available
                      else if (primaryImage.presigned_url && primaryImage.presigned_url !== 'null' && primaryImage.presigned_url !== null) {
                        imageUrl = primaryImage.presigned_url;
                      } else if (primaryImage.image_url && primaryImage.image_url !== 'null' && primaryImage.image_url !== null) {
                        imageUrl = primaryImage.image_url;
                      } else if (primaryImage.image && primaryImage.image !== 'null' && primaryImage.image !== null) {
                        imageUrl = primaryImage.image;
                      }
                    }
                    
                    console.log('=== PRODUCT METRICS IMAGE DEBUG ===');
                    console.log('Product info:', productMetrics.product_info);
                    console.log('Primary image:', primaryImage);
                    console.log('Selected image URL:', imageUrl);
                    console.log('URL source:', primaryImage?.url_source || 'manual_fallback');
                    
                    return imageUrl;
                  })()} 
                  alt={productMetrics.product_info.name} 
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)'
                  }}
                />
              </div>
              
              {/* Basic Product Details */}
              <div className={styles['product-basic-info']} style={{ flex: 1 }}>
                <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.4rem' }}>
                  {productMetrics.product_info.name}
                </h4>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-success)', margin: '5px 0' }}>
                  ${parseFloat(productMetrics.product_info.price).toFixed(2)}
                </p>
                <p style={{ margin: '5px 0', color: 'var(--color-text-muted)' }}>
                  {t('metrics.stock_units', { count: productMetrics.product_info.stock_quantity })}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    backgroundColor: productMetrics.product_info.is_active
                      ? 'color-mix(in srgb, var(--color-success) 18%, var(--color-surface) 82%)'
                      : 'color-mix(in srgb, var(--color-error) 18%, var(--color-surface) 82%)',
                    color: productMetrics.product_info.is_active ? 'var(--color-success)' : 'var(--color-error)'
                  }}>
                    {productMetrics.product_info.is_active ? t('metrics.active') : t('metrics.inactive')}
                  </span>
                </p>
              </div>
            </div>

            <div className={styles['metrics-overview-grid']}>
              <div className={styles['metric-card']}>
                <h4>{t('metrics.product_id')}</h4>
                <p className={styles['metric-value']} style={{ fontSize: '1rem' }}>{productMetrics.product_info.id}</p>
              </div>
              <div className={styles['metric-card']}>
                <h4>{t('metrics.slug')}</h4>
                <p className={styles['metric-value']} style={{ fontSize: '1rem' }}>{productMetrics.product_info.slug}</p>
              </div>
              <div className={styles['metric-card']}>
                <h4>{t('metrics.created_date')}</h4>
                <p className={styles['metric-value']} style={{ fontSize: '1rem' }}>
                  {new Date(productMetrics.product_info.created_at).toLocaleDateString()}
                </p>
              </div>
              {productMetrics.product_info.images && productMetrics.product_info.images.length > 0 && (
                <div className={styles['metric-card']}>
                  <h4>{t('metrics.total_images')}</h4>
                  <p className={styles['metric-value']}>{productMetrics.product_info.images.length}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Metrics Section */}
        <div className={styles['product-metrics-section']}>
          <h3>{t('metrics.product_performance')}</h3>
          <div className={styles['metrics-overview-grid']}>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.total_products')}</h4>
              <p className={styles['metric-value']}>{productMetrics.product_counts.total_products}</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.active_listings')}</h4>
              <p className={styles['metric-value']}>{productMetrics.product_counts.active_listings}</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.categories')}</h4>
              <p className={styles['metric-value']}>{productMetrics.product_counts.total_categories}</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.total_views')}</h4>
              <p className={styles['metric-value']}>{productMetrics.product_metrics.total_views.toLocaleString()}</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.total_clicks')}</h4>
              <p className={styles['metric-value']}>{productMetrics.product_metrics.total_clicks.toLocaleString()}</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.wishlist_adds')}</h4>
              <p className={styles['metric-value']}>{productMetrics.product_metrics.total_favorites.toLocaleString()}</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.cart_additions')}</h4>
              <p className={styles['metric-value']}>{productMetrics.product_metrics.total_cart_additions.toLocaleString()}</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.total_sales')}</h4>
              <p className={styles['metric-value']}>{productMetrics.product_metrics.total_sales}</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.ctr_short')}</h4>
              <p className={styles['metric-value']}>{ctr}%</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.conversion_rate')}</h4>
              <p className={styles['metric-value']}>{conversionRate}%</p>
            </div>
            <div className={styles['metric-card']}>
              <h4>{t('metrics.total_revenue')}</h4>
              <p className={styles['metric-value']}>${parseFloat(productMetrics.product_metrics.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          </div>
        </div>

        <div className={styles['sales-funnel-card']}>
          <h3>{t('metrics.sales_funnel_title')}</h3>
          <div className={styles['funnel-step']}>
            <div className={styles['funnel-label']}>{t('metrics.funnel_views')}</div>
            <div className={styles['funnel-bar-container']}>
              <div className={styles['funnel-bar']} style={{ width: '100%' }}>{productMetrics.product_metrics.total_views.toLocaleString()}</div>
            </div>
          </div>
          <div className={styles['funnel-step']}>
            <div className={styles['funnel-label']}>{t('metrics.funnel_clicks')}</div>
            <div className={styles['funnel-bar-container']}>
              <div className={styles['funnel-bar']} style={{ width: `${productMetrics.product_metrics.total_views > 0 ? (productMetrics.product_metrics.total_clicks / productMetrics.product_metrics.total_views) * 100 : 0}%` }}>
                {productMetrics.product_metrics.total_clicks.toLocaleString()}
              </div>
            </div>
          </div>
          <div className={styles['funnel-step']}>
            <div className={styles['funnel-label']}>{t('metrics.funnel_added_to_cart')}</div>
            <div className={styles['funnel-bar-container']}>
              <div className={styles['funnel-bar']} style={{ width: `${productMetrics.product_metrics.total_views > 0 ? (productMetrics.product_metrics.total_cart_additions / productMetrics.product_metrics.total_views) * 100 : 0}%` }}>
                {productMetrics.product_metrics.total_cart_additions.toLocaleString()}
              </div>
            </div>
          </div>
          <div className={styles['funnel-step']}>
            <div className={styles['funnel-label']}>{t('metrics.funnel_purchased')}</div>
            <div className={styles['funnel-bar-container']}>
              <div className={styles['funnel-bar']} style={{ width: `${productMetrics.product_metrics.total_views > 0 ? (productMetrics.product_metrics.total_sales / productMetrics.product_metrics.total_views) * 100 : 0}%` }}>
                {productMetrics.product_metrics.total_sales.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {productMetrics.recent_orders.length > 0 && (
      <div className={styles['orders-card']}>
            <h3>{productId ? t('metrics.recent_orders_for_product') : t('metrics.recent_orders_title')}</h3>
            <div className="orders-table-container">
        <table className={styles['orders-table']}>
                    <thead>
                        <tr>
                            <th>{t('metrics.order_id')}</th>
                            <th>{t('metrics.customer')}</th>
                            {!productId && <th>{t('products.product_name')}</th>}
                            <th>{t('cart.quantity')}</th>
                            <th>{t('orders.total')}</th>
                            <th>{t('metrics.date')}</th>
                            <th>{t('metrics.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productMetrics.recent_orders.map((order, index) => (
                            <tr key={order.id || index}>
                                <td>{order.id.substring(0, 8)}...</td>
                                <td>{order.customer}</td>
                                {!productId && <td>{order.product_name}</td>}
                                <td>{order.quantity}</td>
                                <td>${parseFloat(order.total_price).toFixed(2)}</td>
                                <td>{order.date}</td>
                                <td>
                  <span className={`${styles['status-badge']} ${styles['status-' + order.status.toLowerCase().replace(' ', '-')]}`}>
                    {order.status}
                  </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {productMetrics.recent_orders.length === 0 && (
          <div className={styles['orders-card']}>
            <h3>{productId ? t('metrics.recent_orders_for_product') : t('metrics.recent_orders_title')}</h3>
            <p>{productId ? t('metrics.no_orders_for_product') : t('metrics.no_recent_orders')}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductMetricsPage;
