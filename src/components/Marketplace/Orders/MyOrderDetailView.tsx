import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useTranslation } from 'react-i18next';
import './Orders.css';
import { orderService } from '../../../services';
import { type Order } from '../../../types/marketplace';

const MyOrderDetailView: React.FC = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const orderData = await orderService.getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#10b981',
      delivered: '#059669',
      cancelled: '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  if (loading) {
    return (
      <Layout>
        <div className="order-detail-container">
          <div className="order-loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="order-detail-container">
          <div className="order-error-state">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Order Not Found</h3>
            <p className="error-description">{error || 'This order could not be found or you do not have permission to view it.'}</p>
            <Link to="/my-orders" className="back-to-orders-btn">
              ← Back to Orders
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="order-detail-container">
        {/* Modern Breadcrumb */}
        <div className="modern-breadcrumb">
          <Link to="/my-orders" className="modern-breadcrumb-link">
            <span className="breadcrumb-icon">←</span>
            <span className="breadcrumb-text">Back to Orders</span>
          </Link>
        </div>

        {/* Modern Order Detail Card */}
        <div className="modern-order-card">
          
          {/* Modern Order Header */}
          <div className="modern-order-header">
            <div className="header-content">
              <div className="order-title-section">
                <div className="order-id-display">
                  <span className="order-label">Order</span>
                  <h1 className="order-number">#{order.id.slice(-8)}</h1>
                </div>
                <div className="order-date-info">
                  <span className="date-label">Placed on</span>
                  <span className="order-date">{formatOrderDate(order.created_at)}</span>
                </div>
              </div>
              
              <div className="header-status-section">
                <div 
                  className="modern-status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
                <div className="order-total-section">
                  <span className="total-label">Total</span>
                  <span className="total-amount">${order.total_amount || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Items Section */}
          <div className="modern-section">
            <div className="modern-section-header">
              <h2 className="modern-section-title">
                <span className="section-icon">📦</span>
                Items in Your Order
              </h2>
              <span className="modern-item-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
            </div>
            
            <div className="modern-items-grid">
              {order.items.map((item) => (
                <div key={item.id} className="modern-item-card">
                  <div className="modern-item-image">
                    <img 
                      src={(() => {
                        // Enhanced image URL resolution for order items
                        // Prioritize stored product_image but add fallback logic
                        let imageUrl = '/placeholder-product.svg';
                        
                        if (item.product_image && item.product_image !== 'null' && item.product_image !== '') {
                          imageUrl = item.product_image;
                        } else {
                          // If no stored image, try to construct a fallback URL
                          // This helps with old orders that might have empty product_image
                          console.log('⚠️ No stored product_image available, using placeholder for order item:', item.product_name);
                        }
                        
                        console.log('=== MY ORDER DETAIL - ORDER ITEM IMAGE DEBUG ===');
                        console.log('Order ID:', order.id);
                        console.log('Item:', item.product_name);
                        console.log('Stored product_image:', item.product_image);
                        console.log('Product_image type:', typeof item.product_image);
                        console.log('Product_image length:', item.product_image?.length);
                        console.log('Is empty check:', !item.product_image || item.product_image === 'null' || item.product_image === '');
                        console.log('Selected imageUrl:', imageUrl);
                        console.log('Full order item data:', item);
                        
                        return imageUrl;
                      })()}
                      alt={item.product_name}
                      className="item-thumbnail"
                      onError={(e) => {
                        // Fallback to placeholder on image load error
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/placeholder-product.svg') {
                          console.log('Image failed to load, using placeholder:', target.src);
                          target.src = '/placeholder-product.svg';
                        }
                      }}
                    />
                    <div className="modern-quantity-badge">{item.quantity}x</div>
                  </div>
                  
                  <div className="modern-item-details">
                    <div className="item-meta">
                      <span className="seller-info">
                        <span className="seller-icon">🏢</span>
                        <span className="seller-name">{item.seller?.username || 'Unknown Seller'}</span>
                      </span>
                    </div>
                    <h3 className="modern-item-name">{item.product_name}</h3>
                    
                    <div className="modern-pricing-grid">
                      <div className="price-detail">
                        <span className="price-label">Unit Price</span>
                        <span className="price-value">${item.price}</span>
                      </div>
                      <div className="price-detail">
                        <span className="price-label">Total</span>
                        <span className="price-value total-highlight">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Section */}
          {order.shipping_info && order.shipping_info.length > 0 && (
            <div className="order-section">
              <div className="section-header">
                <h2 className="section-title">Shipping & Tracking</h2>
                <span className="shipping-count">{order.shipping_info.length} shipment{order.shipping_info.length > 1 ? 's' : ''}</span>
              </div>
              
              <div className="shipping-list">
                {order.shipping_info.map((shipping, index) => (
                  <div key={index} className="shipping-card">
                    <div className="shipping-header">
                      <div className="seller-info">
                        <div className="seller-avatar">
                          {shipping.seller.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="seller-details">
                          <h4 className="seller-name">{shipping.seller.username}</h4>
                          {shipping.shipped_date && (
                            <span className="shipped-date">
                              Shipped on {new Date(shipping.shipped_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {shipping.tracking_number ? (
                      <div className="tracking-info">
                        <div className="tracking-detail">
                          <span className="tracking-label">Tracking Number</span>
                          <div className="tracking-number">{shipping.tracking_number}</div>
                        </div>
                        {shipping.shipping_carrier && (
                          <div className="tracking-detail">
                            <span className="tracking-label">Carrier</span>
                            <span className="carrier-name">{shipping.shipping_carrier}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-tracking">
                        <div className="preparing-status">
                          <span>📦 Preparing for shipment</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default MyOrderDetailView;