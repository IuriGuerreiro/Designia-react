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
        <div className="orders-page">
          <div className="loading-message">
            <p>Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="orders-page">
          <div className="error-message">
            <p>{error || 'Order not found'}</p>
            <Link to="/my-orders" className="btn btn-primary">
              Back to Orders
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="orders-page">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/my-orders">My Orders</Link>
          <span> / </span>
          <span>Order #{order.id.slice(-8)}</span>
        </div>

        {/* Sophisticated Order Detail Container */}
        <div className="sophisticated-order-detail">
          
          {/* Hero Header Section */}
          <div className="order-hero-section">
            <div className="order-hero-content">
              <div className="order-hero-main">
                <div className="order-number-section">
                  <span className="order-prefix">Order</span>
                  <h1 className="order-hero-number">#{order.id.slice(-8)}</h1>
                </div>
                <div className="order-meta-info">
                  <p className="order-placement-date">
                    Placed on {formatOrderDate(order.created_at)}
                  </p>
                </div>
              </div>
              
              <div className="order-hero-status">
                <div 
                  className="sophisticated-status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
                <div className="sophisticated-total">
                  <span className="total-label">Total</span>
                  <span className="total-amount">${order.total_amount || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid Section - Matching ProductList Style */}
          <div className="sophisticated-section items-section">
            <div className="section-header-sophisticated">
              <h2 className="section-title-sophisticated">Items in Your Order</h2>
              <span className="item-count-sophisticated">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
            </div>
            
            <div className="sophisticated-items-grid">
              {order.items.map((item) => (
                <div key={item.id} className="sophisticated-item-card">
                  <div className="item-image-wrapper">
                    <div className="item-image-container">
                      <img 
                        src={item.product_image || '/placeholder-product.png'}
                        alt={item.product_name}
                        className="sophisticated-item-image"
                      />
                      <div className="quantity-overlay">{item.quantity}x</div>
                    </div>
                  </div>
                  
                  <div className="sophisticated-item-info">
                    <div className="item-meta-top">
                      <span className="item-seller">
                        Sold by <strong>{item.seller?.username || 'Unknown'}</strong>
                      </span>
                    </div>
                    <h3 className="sophisticated-item-name">{item.product_name}</h3>
                    
                    <div className="sophisticated-pricing">
                      <div className="price-per-item">
                        <span className="price-label">Unit Price:</span>
                        <span className="unit-price">${item.price}</span>
                      </div>
                      <div className="total-price">
                        <span className="total-label">Total:</span>
                        <span className="item-total-price">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Tracking Section */}
          {order.shipping_info && order.shipping_info.length > 0 && (
            <div className="sophisticated-section shipping-section">
              <div className="section-header-sophisticated">
                <h2 className="section-title-sophisticated">Shipping & Tracking</h2>
                <span className="shipping-count-sophisticated">{order.shipping_info.length} shipment{order.shipping_info.length > 1 ? 's' : ''}</span>
              </div>
              
              <div className="sophisticated-shipping-grid">
                {order.shipping_info.map((shipping, index) => (
                  <div key={index} className="sophisticated-shipping-card">
                    <div className="shipping-card-header">
                      <div className="seller-avatar-section">
                        <div className="seller-avatar">
                          {shipping.seller.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="seller-details">
                          <h4 className="sophisticated-seller-name">{shipping.seller.username}</h4>
                          {shipping.shipped_date && (
                            <span className="sophisticated-shipped-date">
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
                      <div className="sophisticated-tracking-details">
                        <div className="tracking-row">
                          <div className="tracking-field">
                            <span className="field-label">Tracking Number</span>
                            <div className="sophisticated-tracking-code">{shipping.tracking_number}</div>
                          </div>
                        </div>
                        {shipping.shipping_carrier && (
                          <div className="tracking-row">
                            <div className="tracking-field">
                              <span className="field-label">Shipping Carrier</span>
                              <span className="sophisticated-carrier">{shipping.shipping_carrier}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="sophisticated-no-tracking">
                        <div className="preparing-badge">
                          <span>📦 Preparing for shipment</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary Section */}
          <div className="sophisticated-section summary-section">
            <div className="section-header-sophisticated">
              <h2 className="section-title-sophisticated">Order Summary</h2>
            </div>
            
            <div className="sophisticated-summary-card">
              <div className="summary-breakdown">
                <div className="summary-line">
                  <span className="summary-description">Items ({order.items.length})</span>
                  <span className="summary-amount">
                    ${order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
                <div className="summary-line">
                  <span className="summary-description">Shipping & Handling</span>
                  <span className="summary-amount free-badge">Free</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-line total-line">
                  <span className="summary-description total-description">Order Total</span>
                  <span className="summary-amount total-final">
                    ${order.total_amount || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="sophisticated-section actions-section">
            <div className="section-header-sophisticated">
              <h2 className="section-title-sophisticated">Order Actions</h2>
            </div>
            
            <div className="sophisticated-actions-grid">
              <div className="action-buttons-sophisticated">
                {['pending', 'confirmed'].includes(order.status) && (
                  <button className="sophisticated-btn sophisticated-btn-secondary">
                    <span className="btn-icon">🚫</span>
                    <span className="btn-text">Cancel Order</span>
                  </button>
                )}
                
                {order.status === 'delivered' && (
                  <button className="sophisticated-btn sophisticated-btn-primary">
                    <span className="btn-icon">⭐</span>
                    <span className="btn-text">Leave Review</span>
                  </button>
                )}
                
                <button className="sophisticated-btn sophisticated-btn-outline">
                  <span className="btn-icon">💬</span>
                  <span className="btn-text">Contact Support</span>
                </button>
              </div>
              
              <div className="support-notice">
                <div className="notice-content">
                  <div className="notice-icon">ℹ️</div>
                  <p className="notice-text">Need assistance with your order? Our dedicated support team is available 24/7 to help resolve any concerns.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyOrderDetailView;