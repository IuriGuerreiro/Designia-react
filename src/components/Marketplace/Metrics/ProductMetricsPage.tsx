import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import './Metrics.css';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../features/auth/state/AuthContext';

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
        // If productId is provided, fetch metrics for specific product, otherwise fetch all seller metrics
        const url = productId 
          ? `/api/marketplace/metrics/product_metrics/${productId}/`
          : '/api/marketplace/metrics/dashboard_metrics/';
          
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        
        const data = await response.json();
        setProductMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load metrics data');
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
        <div className="metrics-page-container">
          <div className="metrics-header">
            <h2>Loading...</h2>
            <p>Fetching your metrics data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="metrics-page-container">
          <div className="metrics-header">
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="metrics-page-container">
        <div className="metrics-header">
          <h2>
            {productId 
              ? `Product Analytics: ${productMetrics.product_info?.name || 'Loading...'}`
              : 'Seller Dashboard'
            }
          </h2>
          <p>{productId ? 'Individual product performance metrics' : 'Your marketplace performance overview'}</p>
        </div>

        {/* Product Info Section (only for individual product view) */}
        {productId && productMetrics.product_info?.name && (
          <div className="product-info-section">
            <h3>Product Information</h3>
            
            {/* Product Image and Basic Info */}
            <div className="product-summary-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' }}>
              {/* Product Image */}
              <div className="product-image-container" style={{ flexShrink: 0 }}>
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
                    border: '1px solid #e0e0e0'
                  }}
                />
              </div>
              
              {/* Basic Product Details */}
              <div className="product-basic-info" style={{ flex: 1 }}>
                <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.4rem' }}>
                  {productMetrics.product_info.name}
                </h4>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c5530', margin: '5px 0' }}>
                  ${parseFloat(productMetrics.product_info.price).toFixed(2)}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  Stock: {productMetrics.product_info.stock_quantity} units
                </p>
                <p style={{ margin: '5px 0' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.9rem',
                    backgroundColor: productMetrics.product_info.is_active ? '#d4edda' : '#f8d7da',
                    color: productMetrics.product_info.is_active ? '#155724' : '#721c24'
                  }}>
                    {productMetrics.product_info.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>

            <div className="metrics-overview-grid">
              <div className="metric-card">
                <h4>Product ID</h4>
                <p className="metric-value" style={{ fontSize: '1rem' }}>{productMetrics.product_info.id}</p>
              </div>
              <div className="metric-card">
                <h4>Slug</h4>
                <p className="metric-value" style={{ fontSize: '1rem' }}>{productMetrics.product_info.slug}</p>
              </div>
              <div className="metric-card">
                <h4>Created Date</h4>
                <p className="metric-value" style={{ fontSize: '1rem' }}>
                  {new Date(productMetrics.product_info.created_at).toLocaleDateString()}
                </p>
              </div>
              {productMetrics.product_info.images && productMetrics.product_info.images.length > 0 && (
                <div className="metric-card">
                  <h4>Total Images</h4>
                  <p className="metric-value">{productMetrics.product_info.images.length}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Metrics Section */}
        <div className="product-metrics-section">
          <h3>Product Performance</h3>
          <div className="metrics-overview-grid">
            <div className="metric-card">
              <h4>Total Products</h4>
              <p className="metric-value">{productMetrics.product_counts.total_products}</p>
            </div>
            <div className="metric-card">
              <h4>Active Listings</h4>
              <p className="metric-value">{productMetrics.product_counts.active_listings}</p>
            </div>
            <div className="metric-card">
              <h4>Categories</h4>
              <p className="metric-value">{productMetrics.product_counts.total_categories}</p>
            </div>
            <div className="metric-card">
              <h4>Total Views</h4>
              <p className="metric-value">{productMetrics.product_metrics.total_views.toLocaleString()}</p>
            </div>
            <div className="metric-card">
              <h4>Total Clicks</h4>
              <p className="metric-value">{productMetrics.product_metrics.total_clicks.toLocaleString()}</p>
            </div>
            <div className="metric-card">
              <h4>Wishlist Adds</h4>
              <p className="metric-value">{productMetrics.product_metrics.total_favorites.toLocaleString()}</p>
            </div>
            <div className="metric-card">
              <h4>Cart Additions</h4>
              <p className="metric-value">{productMetrics.product_metrics.total_cart_additions.toLocaleString()}</p>
            </div>
            <div className="metric-card">
              <h4>Total Sales</h4>
              <p className="metric-value">{productMetrics.product_metrics.total_sales}</p>
            </div>
            <div className="metric-card">
              <h4>CTR</h4>
              <p className="metric-value">{ctr}%</p>
            </div>
            <div className="metric-card">
              <h4>Conversion Rate</h4>
              <p className="metric-value">{conversionRate}%</p>
            </div>
            <div className="metric-card">
              <h4>Total Revenue</h4>
              <p className="metric-value">${parseFloat(productMetrics.product_metrics.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          </div>
        </div>

        <div className="sales-funnel-card">
          <h3>Sales Funnel</h3>
          <div className="funnel-step">
            <div className="funnel-label">Views</div>
            <div className="funnel-bar-container">
              <div className="funnel-bar" style={{ width: '100%' }}>{productMetrics.product_metrics.total_views.toLocaleString()}</div>
            </div>
          </div>
          <div className="funnel-step">
            <div className="funnel-label">Clicks</div>
            <div className="funnel-bar-container">
              <div className="funnel-bar" style={{ width: `${productMetrics.product_metrics.total_views > 0 ? (productMetrics.product_metrics.total_clicks / productMetrics.product_metrics.total_views) * 100 : 0}%` }}>
                {productMetrics.product_metrics.total_clicks.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="funnel-step">
            <div className="funnel-label">Added to Cart</div>
            <div className="funnel-bar-container">
              <div className="funnel-bar" style={{ width: `${productMetrics.product_metrics.total_views > 0 ? (productMetrics.product_metrics.total_cart_additions / productMetrics.product_metrics.total_views) * 100 : 0}%` }}>
                {productMetrics.product_metrics.total_cart_additions.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="funnel-step">
            <div className="funnel-label">Purchased</div>
            <div className="funnel-bar-container">
              <div className="funnel-bar" style={{ width: `${productMetrics.product_metrics.total_views > 0 ? (productMetrics.product_metrics.total_sales / productMetrics.product_metrics.total_views) * 100 : 0}%` }}>
                {productMetrics.product_metrics.total_sales.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {productMetrics.recent_orders.length > 0 && (
          <div className="orders-card">
            <h3>{productId ? 'Recent Orders for This Product' : 'Recent Orders'}</h3>
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            {!productId && <th>Product</th>}
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Status</th>
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
                                    <span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
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
          <div className="orders-card">
            <h3>{productId ? 'Recent Orders for This Product' : 'Recent Orders'}</h3>
            <p>{productId ? 'No orders found for this product.' : 'No recent orders found.'}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductMetricsPage;