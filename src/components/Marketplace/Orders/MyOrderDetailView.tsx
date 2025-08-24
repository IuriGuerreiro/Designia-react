import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../../services';
import { type Order } from '../../../types/marketplace';
import './OrderDetail.css';

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

  // Helper function to get the best available image URL
  const getBestImageUrl = (item: any) => {
    // Try fresh product_image_fresh first (new presigned URLs)
    if (item.product_image_fresh && 
        item.product_image_fresh !== 'null' && 
        item.product_image_fresh !== '' && 
        item.product_image_fresh !== 'undefined' &&
        item.product_image_fresh !== 'None') {
      
      return item.product_image_fresh;
    }
    
    // Fallback to stored product_image (might be expired)
    if (item.product_image && 
        item.product_image !== 'null' && 
        item.product_image !== '' && 
        item.product_image !== 'undefined' &&
        item.product_image !== 'None') {
      
      return item.product_image;
    }
    
    // Final fallback to placeholder
    return '/placeholder-product.svg';
  };

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status: string) => {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending_payment': '⏳',
      'payment_confirmed': '✅',
      'awaiting_shipment': '📦',
      'shipped': '🚚',
      'delivered': '🎉',
      'cancelled': '❌',
      'refunded': '💰'
    };
    return icons[status as keyof typeof icons] || '📋';
  };

  if (loading) {
    return (
      <Layout>
        <div className="order-detail-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading order details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="order-detail-error">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Order Not Found</h3>
          <p className="error-description">{error || 'This order could not be found or you do not have permission to view it.'}</p>
          <Link to="/my-orders" className="back-to-orders-btn">
            ← Back to Orders
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="order-detail-container">
        {/* Premium Breadcrumb */}
        <div className="order-detail-breadcrumb">
          <Link to="/my-orders" className="breadcrumb-link">
            <span className="breadcrumb-icon">←</span>
            <span className="breadcrumb-text">Back to Orders</span>
          </Link>
        </div>

        {/* Premium Order Header */}
        <div className="order-detail-header">
          <div className="header-content">
            <div className="order-title-section">
              <div className="order-id-display">
                <span className="order-label">Order Number</span>
                <h1 className="order-number">#{order.id.slice(-8)}</h1>
              </div>
              <div className="order-date-info">
                <span className="date-label">Order Placed</span>
                <span className="order-date">{formatOrderDate(order.created_at)}</span>
              </div>
            </div>
            
            <div className="header-status-section">
              <div className={`status-badge ${getStatusClass(order.status)}`}>
                <span className="status-icon">{getStatusIcon(order.status)}</span>
                <span className="status-text">{order.status.replace('_', ' ')}</span>
              </div>
              <div className="order-total-section">
                <span className="total-label">Total Amount</span>
                <span className="total-amount">${order.total_amount || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Order Items Section */}
        <div className="order-detail-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📦</span>
              Order Items
            </h2>
            <span className="item-count-badge">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
          </div>
          
          <div className="order-items-grid">
            {order.items.map((item) => (
              <div key={item.id} className="order-item-card">
                <div className="item-image-container">
                  <img 
                    src={getBestImageUrl(item)}
                    alt={item.product_name}
                    className="item-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/placeholder-product.svg') {
                        target.src = '/placeholder-product.svg';
                      }
                    }}
                  />
                  <div className="quantity-badge">{item.quantity}x</div>
                </div>
                
                <div className="item-details">
                  <div className="item-meta">
                    <span className="seller-info">
                      <span className="seller-icon">🏢</span>
                      <span className="seller-name">{item.seller || 'Unknown Seller'}</span>
                    </span>
                  </div>
                  <h3 className="item-name">{item.product_name}</h3>
                  
                  <div className="pricing-grid">
                    <div className="price-detail">
                      <span className="price-label">Unit Price</span>
                      <span className="price-value">${item.unit_price}</span>
                    </div>
                    <div className="price-detail">
                      <span className="price-label">Total</span>
                      <span className="price-value total-highlight">
                        ${item.total_price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Shipping Section */}
        {order.shipping_info && order.shipping_info.length > 0 && (
          <div className="order-detail-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">🚚</span>
                Shipping & Tracking
              </h2>
              <span className="shipping-count-badge">{order.shipping_info.length} shipment{order.shipping_info.length > 1 ? 's' : ''}</span>
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
                        {shipping.shipped_at && (
                          <span className="shipped-date">
                            Shipped on {new Date(shipping.shipped_at).toLocaleDateString('en-US', {
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

        {/* Premium Order Summary */}
        <div className="order-detail-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📋</span>
              Order Summary
            </h2>
          </div>
          
          <div className="order-summary-card">
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">${order.subtotal}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Shipping</span>
              <span className="summary-value">${order.shipping_cost}</span>
            </div>
            {order.tax_amount > 0 && (
              <div className="summary-row">
                <span className="summary-label">Tax</span>
                <span className="summary-value">${order.tax_amount}</span>
              </div>
            )}
            {order.discount_amount > 0 && (
              <div className="summary-row">
                <span className="summary-label">Discount</span>
                <span className="summary-value discount-value">-${order.discount_amount}</span>
              </div>
            )}
            <div className="summary-divider"></div>
            <div className="summary-row final-total">
              <span className="summary-label">Total</span>
              <span className="summary-value">${order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyOrderDetailView;