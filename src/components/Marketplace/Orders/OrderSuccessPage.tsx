import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { orderService } from '../../../features/marketplace/api';
import { type Order } from '../../../types/marketplace';
import './Orders.css';

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get the best available image URL
  const getBestImageUrl = (item: any) => {
    // Try fresh product_image_fresh first (new presigned URLs)
    if (item.product_image_fresh && 
        item.product_image_fresh !== 'null' && 
        item.product_image_fresh !== '' && 
        item.product_image_fresh !== 'undefined' &&
        item.product_image_fresh !== 'None') {
      
      console.log(`Using fresh image URL for ${item.product_name}:`, item.product_image_fresh);
      return item.product_image_fresh;
    }
    
    // Fallback to stored product_image (might be expired)
    if (item.product_image && 
        item.product_image !== 'null' && 
        item.product_image !== '' && 
        item.product_image !== 'undefined' &&
        item.product_image !== 'None') {
      
      console.log(`Using stored image URL for ${item.product_name}:`, item.product_image);
      return item.product_image;
    }
    
    // Final fallback to placeholder
    console.log(`No valid image URL for ${item.product_name}, using placeholder`);
    return '/placeholder-product.svg';
  };

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('Order ID not provided');
        setLoading(false);
        return;
      }
      try {
        const orderData = await orderService.getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
        <div className="order-success-loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading order details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="order-success-error">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Order Not Found</h2>
          <p className="error-description">{error || 'The order could not be found.'}</p>
          <Link to="/my-orders" className="btn-primary">View My Orders</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="order-success-page">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">Thank you for your purchase. Your order #{order.id} has been confirmed.</p>
        </div>

        {/* Order Content Layout */}
        <div className="order-success-layout">
          {/* Order Items Column */}
          <div className="order-items-column">
            <div className="section-header">
              <h3 className="section-title">Items Ordered</h3>
              <span className="item-count-badge">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
            </div>
            <div className="order-items-list">
              {order.items.map((item) => {
                const imageUrl = getBestImageUrl(item);
                
                return (
                  <div key={item.id} className="order-item-card">
                    <div className="item-image-container">
                      <img 
                        src={imageUrl}
                        alt={item.product_name}
                        className="item-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.warn(`Image failed to load for ${item.product_name}, falling back to placeholder`);
                          if (target.src !== '/placeholder-product.svg') {
                            target.src = '/placeholder-product.svg';
                          }
                        }}
                      />
                      <div className="quantity-badge">{item.quantity}</div>
                    </div>
                    <div className="item-details">
                      <h4 className="item-name">{item.product_name}</h4>
                      <div className="item-meta">
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-unit-price">${item.unit_price}</span>
                      </div>
                    </div>
                    <div className="item-total">
                      <span className="total-label">Total</span>
                      <span className="total-amount">${item.total_price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="order-summary-column">
            {/* Order Summary Card */}
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-breakdown">
                <div className="summary-row">
                  <span className="summary-label">Subtotal:</span>
                  <span className="summary-value">${order.subtotal}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Shipping:</span>
                  <span className="summary-value">${order.shipping_cost}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row final-total">
                  <span className="summary-label">Total:</span>
                  <span className="summary-value">${order.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="shipping-card">
              <h3 className="shipping-title">Shipping To</h3>
              <div className="shipping-address">
                <p className="recipient-name">{order.shipping_address.name}</p>
                <p className="street-address">{order.shipping_address.street}</p>
                <p className="city-state-zip">
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/products" className="btn-primary">
            🛍️ Continue Shopping
          </Link>
          <Link to="/my-orders" className="btn-secondary">
            📋 View All Orders
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccessPage;
