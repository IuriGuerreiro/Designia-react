import React, { useState, useEffect } from 'react';
import Layout from '../../Layout/Layout';
import { useTranslation } from 'react-i18next';
import './Orders.css';
import { Link } from 'react-router-dom';
import { orderService } from '../../../services';
import { type Order } from '../../../types/marketplace';

const MyOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userOrders = await orderService.getOrders();
        setOrders(userOrders);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusClass = (status: string) => {
    return `status-${status.toLowerCase()}`;
  };

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="orders-page">
          <div className="loading-message">
            <p>Loading your orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="orders-page">
        {/* Modern Header Section - ProductList Style */}
        <div className="products-header">
          <div className="header-content">
            <h2>My Orders</h2>
            <p className="page-subtitle">Track and manage your purchases</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orders.filter(o => ['shipped', 'delivered'].includes(o.status)).length}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <div className="error-content">
              <h3>⚠️ Unable to Load Orders</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <div className="tabs">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                className={`tab ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <div className="filter-summary">
            <p>Showing {filteredOrders.length} of {orders.length} orders</p>
          </div>
        )}
        
        {filteredOrders.length > 0 ? (
          <div className="products-grid">
            {filteredOrders.map(order => (
              <div key={order.id} className="product-card">
                {/* Status Badges - ProductCard Style */}
                <div className="product-card-badges">
                  <div className="badge status-badge" 
                       style={{ 
                         backgroundColor: order.status === 'delivered' ? '#28a745' :
                                        order.status === 'shipped' ? '#fd7e14' :
                                        order.status === 'cancelled' ? '#dc3545' :
                                        order.status === 'pending' ? '#ffc107' : '#6c757d'
                       }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                {/* Order Info - ProductCard Style */}
                <div className="product-info">
                  <div className="product-meta-top">
                    <div className="order-number">
                      <span className="order-prefix">Order </span>
                      <strong>#{order.id.slice(-8)}</strong>
                    </div>
                    <span className="order-date">{formatOrderDate(order.created_at)}</span>
                  </div>
                  <div className="product-name">
                    <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  </div>

                  {/* Items Preview - Simplified */}
                  <div className="items-preview">
                    <div className="items-summary">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="item-summary">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-quantity">{item.quantity}x</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="more-items">
                          <span>+{order.items.length - 3} more items</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Status */}
                  {order.shipping_info && order.shipping_info.length > 0 && (
                    <div className="shipping-status">
                      <h4>🚚 Shipping Updates</h4>
                      <div className="shipping-list">
                        {order.shipping_info.slice(0, 2).map((shipping, index) => (
                          <div key={index} className="shipping-item">
                            <div className="seller-info">
                              <span className="seller-name">{shipping.seller.username}:</span>
                            </div>
                            {shipping.tracking_number ? (
                              <div className="tracking-info">
                                <span className="tracking-code">{shipping.tracking_number}</span>
                                {shipping.shipping_carrier && (
                                  <span className="carrier"> ({shipping.shipping_carrier})</span>
                                )}
                              </div>
                            ) : (
                              <span className="preparing">Preparing shipment</span>
                            )}
                          </div>
                        ))}
                        {order.shipping_info.length > 2 && (
                          <div className="more-shipping">
                            <span>+{order.shipping_info.length - 2} more sellers</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Legacy tracking fallback */}
                  {!order.shipping_info?.length && order.tracking_number && (
                    <div className="shipping-status">
                      <h4>📦 Tracking Information</h4>
                      <div className="tracking-info">
                        <span className="tracking-code">{order.tracking_number}</span>
                        {order.shipping_carrier && (
                          <span className="carrier"> ({order.shipping_carrier})</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing & Actions - ProductCard Style */}
                  <div className="product-pricing">
                    <div className="current-price">${order.total_amount || '0.00'}</div>
                  </div>
                  
                  <div className="product-actions">
                    <Link to={`/my-orders/${order.id}`} className="add-to-cart-btn btn btn-primary">
                      👁️ View Details
                    </Link>
                    {['pending', 'confirmed'].includes(order.status) && (
                      <button className="btn btn-secondary" title="Cancel Order">
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results-message">
            <div className="empty-state-content">
              <div className="empty-state-icon">📦</div>
              <h3>No Orders Found</h3>
              <p>
                {filterStatus === 'all' 
                  ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                  : `No orders found with status "${filterStatus}". Try a different filter.`
                }
              </p>
              {filterStatus === 'all' && (
                <Link to="/" className="btn btn-primary">
                  🛍️ Start Shopping
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrdersPage;