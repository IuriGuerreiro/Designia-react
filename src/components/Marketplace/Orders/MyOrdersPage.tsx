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
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

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

  const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const reason = window.prompt('Please provide a reason for cancelling this order:');
    if (!reason || reason.trim() === '') {
      return; // User cancelled or didn't provide a reason
    }

    setCancellingOrderId(orderId);
    
    try {
      const result = await orderService.cancelOrderWithReason(orderId, reason.trim());
      
      // Only update cancellation metadata, not order status (will be updated by webhook)
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                cancelled_at: result.order.cancelled_at,
                cancellation_reason: result.order.cancellation_reason 
              }
            : order
        )
      );

      // Show success message
      alert(
        result.refund_requested 
          ? `Cancellation request submitted! Refund of $${result.refund_amount} will be processed. Order status will update once the refund is confirmed.`
          : 'Order cancelled successfully!'
      );
      
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err instanceof Error ? err.message : 'Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Filter orders by status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending_payment: orders.filter(o => o.status === 'pending_payment').length,
    payment_confirmed: orders.filter(o => o.status === 'payment_confirmed').length,
    awaiting_shipment: orders.filter(o => o.status === 'awaiting_shipment').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="orders-container">
          <div className="orders-loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="orders-container">
        {/* Header Section - Matching Mobile Design */}
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
        </div>
        
        {/* Search Bar - Matching Mobile Design */}
        <div className="orders-search-container">
          <input
            className="orders-search-input"
            type="text"
            placeholder="Search orders by ID or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Status Tabs - Matching Mobile Design */}
        {orders.length > 0 && (
          <div className="orders-status-tabs">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                className={`orders-status-tab ${filterStatus === status ? 'active-status-tab' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                <span className="status-tab-text">
                  {status === 'pending_payment' ? 'Pending Payment' :
                   status === 'payment_confirmed' ? 'Payment Confirmed' :
                   status === 'awaiting_shipment' ? 'Awaiting Shipment' :
                   status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </span>
              </button>
            ))}
          </div>
        )}
        
        {error && (
          <div className="orders-error-state">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Unable to Load Orders</h3>
            <p className="error-description">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="error-retry-btn"
            >
              🔄 Try Again
            </button>
          </div>
        )}
        
        {/* Order Cards - Matching Mobile Design Style */}
        {filteredOrders.length > 0 ? (
          <div className="orders-list-container">
            <div className="orders-count">
              <span className="count-text">Showing {filteredOrders.length} of {orders.length} orders</span>
            </div>
            <div className="orders-list">
              {filteredOrders.map(order => (
                <Link key={order.id} to={`/my-orders/${order.id}`} className="order-card-link">
                  <div className="order-card">
                    <div className="order-content-row">
                      {/* Product Images */}
                      <div className="order-images-section">
                        {order.items.slice(0, 3).map((item, index) => {
                          // Enhanced image URL resolution for order items
                          // Prioritize stored product_image but add fallback logic
                          let imageUrl = '/placeholder-product.svg';
                          
                          if (item.product_image && item.product_image !== 'null' && item.product_image !== '') {
                            imageUrl = item.product_image;
                          }
                          
                          console.log('=== MY ORDERS PAGE - ORDER ITEM IMAGE DEBUG ===');
                          console.log('Order ID:', order.id);
                          console.log('Item:', item.product_name);
                          console.log('Stored product_image:', item.product_image);
                          console.log('Product_image type:', typeof item.product_image);
                          console.log('Product_image length:', item.product_image?.length);
                          console.log('Is empty check:', !item.product_image || item.product_image === 'null' || item.product_image === '');
                          console.log('Selected imageUrl:', imageUrl);
                          
                          return (
                            <img 
                              key={index}
                              src={imageUrl}
                              alt={item.product_name}
                              className="product-thumbnail"
                              style={{ 
                                marginLeft: index > 0 ? '-8px' : '0',
                                zIndex: 10 - index 
                              }}
                              onError={(e) => {
                                // Fallback to placeholder on image load error
                                const target = e.target as HTMLImageElement;
                                if (target.src !== '/placeholder-product.svg') {
                                  console.log('Image failed to load, using placeholder:', target.src);
                                  target.src = '/placeholder-product.svg';
                                }
                              }}
                            />
                          );
                        })}
                        {order.items.length > 3 && (
                          <div className="more-items-badge">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      
                      {/* Order Number & Date */}
                      <div className="order-id-section">
                        <div className="order-number">
                          <span className="order-prefix">Order</span>
                          <span className="order-id">#{order.id.slice(-8)}</span>
                        </div>
                        <div className="order-date">{formatOrderDate(order.created_at)}</div>
                      </div>
                      
                      {/* Items Info */}
                      <div className="order-items-section">
                        <div className="items-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</div>
                        <div className="items-names">
                          {order.items.slice(0, 2).map((item, index) => (
                            <span key={index} className="item-name-text">
                              {item.product_name}
                              {index < Math.min(order.items.length - 1, 1) && ', '}
                            </span>
                          ))}
                          {order.items.length > 2 && <span className="more-items-text"> +{order.items.length - 2} more</span>}
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="order-status-section">
                        <div className="status-badge" style={{
                          backgroundColor: order.status === 'delivered' ? '#10b981' :
                                         order.status === 'shipped' ? '#f59e0b' :
                                         order.status === 'awaiting_shipment' ? '#8b5cf6' :
                                         order.status === 'payment_confirmed' ? '#06d6a0' :
                                         order.status === 'pending_payment' ? '#fbbf24' :
                                         order.status === 'cancelled' ? '#ef4444' : '#6b7280'
                        }}>
                          {order.status === 'pending_payment' ? 'Pending Payment' :
                           order.status === 'payment_confirmed' ? 'Payment Confirmed' :
                           order.status === 'awaiting_shipment' ? 'Awaiting Shipment' :
                           order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>
                      
                      {/* Price & Actions */}
                      <div className="order-price-section">
                        <div className="total-amount">${order.total_amount || '0.00'}</div>
                        <div className="order-actions">
                          <Link 
                            to={`/my-orders/${order.id}`}
                            className="view-details-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            View Details
                          </Link>
                          {order.status === 'pending_payment' && (
                            <Link 
                              to={`/checkout?retry_order=${order.id}`}
                              className="retry-payment-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'inline-block',
                                marginRight: '8px'
                              }}
                            >
                              Retry Payment
                            </Link>
                          )}
                          {['pending_payment', 'payment_confirmed'].includes(order.status) && (
                            <button 
                              className="cancel-order-btn"
                              onClick={(e) => handleCancelOrder(order.id, e)}
                              disabled={cancellingOrderId === order.id}
                            >
                              {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="orders-empty-state">
            <div className="empty-icon">📦</div>
            <h3 className="empty-title">
              {orders.length === 0 ? 'No Orders Found' : 'No Matching Orders'}
            </h3>
            <p className="empty-description">
              {orders.length === 0 
                ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                : searchTerm 
                  ? `No orders found matching "${searchTerm}". Try a different search term.`
                  : `No orders found with status "${filterStatus}". Try a different filter.`
              }
            </p>
            {orders.length === 0 && (
              <Link to="/" className="start-shopping-btn">
                🛍️ Start Shopping
              </Link>
            )}
            {orders.length > 0 && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} 
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrdersPage;