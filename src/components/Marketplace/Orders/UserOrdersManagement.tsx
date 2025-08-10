import React, { useState, useEffect } from 'react';
import Layout from '../../Layout/Layout';
import { orderService } from '../../../services';
import { type Order } from '../../../types/marketplace';
import './Orders.css';

const UserOrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [showTrackingForm, setShowTrackingForm] = useState<Set<string>>(new Set());
  const [showCancelForm, setShowCancelForm] = useState<Set<string>>(new Set());
  const [trackingData, setTrackingData] = useState<{[orderId: string]: {trackingNumber: string, carrier: string}}>({});
  const [cancelData, setCancelData] = useState<{[orderId: string]: {reason: string}}>({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await orderService.getSellerOrders();
      console.log('=== ORDER ID DEBUG ===');
      console.log('Received orders:', ordersData.length);
      ordersData.forEach((order, index) => {
        console.log(`Order ${index + 1}:`, {
          id: order.id,
          idType: typeof order.id,
          idLength: order.id?.length,
          items: order.items.length,
          sellerShipping: order.seller_shipping
        });
      });
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load seller orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load seller orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrackingForm = (orderId: string) => {
    setShowTrackingForm(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleTrackingDataChange = (orderId: string, field: 'trackingNumber' | 'carrier', value: string) => {
    setTrackingData(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  const toggleCancelForm = (orderId: string) => {
    setShowCancelForm(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleCancelDataChange = (orderId: string, reason: string) => {
    setCancelData(prev => ({
      ...prev,
      [orderId]: { reason }
    }));
  };

  const processOrder = async (orderId: string) => {
    setUpdatingOrders(prev => new Set([...prev, orderId]));
    try {
      const response = await orderService.processOrder(orderId);
      
      // Update the order in the local state
      setOrders(prev => prev.map(o => 
        o.id === orderId ? response.order : o
      ));

      alert(`Order processed successfully! Status updated to ${response.order.status}`);
    } catch (err) {
      console.error('Failed to process order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process order. Please try again.';
      alert(errorMessage);
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };


  const cancelOrderWithReason = async (orderId: string) => {
    const data = cancelData[orderId];
    if (!data?.reason) {
      alert('Please provide a reason for cancellation');
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel this order? Reason: ${data.reason}`)) {
      return;
    }

    setUpdatingOrders(prev => new Set([...prev, orderId]));
    try {
      const response = await orderService.cancelOrderWithReason(orderId, data.reason);
      
      // Update the order in the local state
      setOrders(prev => prev.map(o => 
        o.id === orderId ? response.order : o
      ));

      // Hide the cancel form
      setShowCancelForm(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });

      // Clear the cancel data
      setCancelData(prev => {
        const newData = { ...prev };
        delete newData[orderId];
        return newData;
      });

      alert(`Order cancelled successfully!`);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order. Please try again.';
      alert(errorMessage);
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const updateTrackingNumber = async (orderId: string) => {
    const data = trackingData[orderId];
    if (!data?.trackingNumber) {
      alert('Please enter a tracking number (código do gajo das encomendas)');
      return;
    }

    console.log('=== FRONTEND TRACKING UPDATE ===');
    console.log('Order ID:', orderId);
    console.log('Tracking Data:', data);

    setUpdatingOrders(prev => new Set([...prev, orderId]));
    try {
      const response = await orderService.updateTracking(orderId, data.trackingNumber, data.carrier);
      
      console.log('Tracking response received:', response);
      
      // Update the order in the local state with the new order data
      setOrders(prev => prev.map(o => 
        o.id === orderId ? response.order : o
      ));

      // Hide the tracking form
      setShowTrackingForm(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });

      // Clear the tracking data
      setTrackingData(prev => {
        const newData = { ...prev };
        delete newData[orderId];
        return newData;
      });

      // Show success message - now includes seller-specific info
      const successMessage = response.shipping_info 
        ? `Your tracking number added successfully! ${response.message}` 
        : `Tracking number added successfully! ${response.message}`;
      
      alert(successMessage);
      
      // Optionally reload orders to get the most up-to-date data
      await loadOrders();
      
    } catch (err) {
      console.error('Failed to update tracking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add tracking number. Please try again.';
      alert(errorMessage);
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'processing': return '#6f42c1';
      case 'shipped': return '#fd7e14';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'refunded': return '#6c757d';
      default: return '#6c757d';
    }
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
        <div className="order-management-page">
          <div className="loading-message">
            <p>Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="order-management-page">
        {/* Modern Header Section - ProductList Style */}
        <div className="products-header">
          <div className="header-content">
            <h2>Order Management</h2>
            <p className="page-subtitle">Fulfill orders and manage your seller responsibilities</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length}</span>
              <span className="stat-label">Requires Action</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orders.filter(o => ['shipped', 'delivered'].includes(o.status)).length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-content">
              <h3>⚠️ Unable to Load Orders</h3>
              <p>{error}</p>
              <button onClick={loadOrders} className="btn btn-primary">
                🔄 Try Again
              </button>
            </div>
          </div>
        )}

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

        <div className="filter-summary">
          <p>Showing {filteredOrders.length} of {orders.length} orders</p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-results-message">
            <div className="empty-state-content">
              <div className="empty-state-icon">📋</div>
              <h3>No Orders to Fulfill</h3>
              <p>
                {filterStatus === 'all' 
                  ? "You don't have any orders to fulfill as a seller yet. Orders will appear here when customers purchase your products." 
                  : `No orders found with status "${filterStatus}". Try a different filter to see more orders.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                {/* Status Badge - ProductCard Style */}
                <div className="product-card-badges">
                  <div 
                    className="badge status-badge" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                {/* Order Header - ProductCard Style */}
                <div className="order-header">
                  <div className="order-number-section">
                    <span className="order-prefix">Order</span>
                    <h3 className="order-number">#{order.id.slice(-8)}</h3>
                  </div>
                  <div className="order-meta">
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="item-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="order-content">
                  
                  {/* Customer Info */}
                  <div className="info-section customer-info">
                    <div className="section-header">
                      <h4>👤 Customer</h4>
                    </div>
                    <div className="customer-details">
                      <div className="customer-avatar">
                        {order.buyer.first_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="customer-data">
                        <p className="customer-name">{order.buyer.first_name} {order.buyer.last_name}</p>
                        <p className="customer-username">@{order.buyer.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="info-section shipping-info">
                    <div className="section-header">
                      <h4>📍 Shipping Address</h4>
                    </div>
                    <div className="shipping-address">
                      <p className="address-name">{order.shipping_address.name}</p>
                      <p className="address-street">{order.shipping_address.street}</p>
                      <p className="address-city">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                    </div>
                        
                    {/* Tracking Information */}
                    {order.seller_shipping && (
                      <div className="tracking-section">
                        <h5>📦 Your Tracking Information</h5>
                        <div className="tracking-details">
                          {order.seller_shipping.tracking_number && (
                            <div className="tracking-field">
                              <span className="field-label">Tracking Number:</span>
                              <span className="tracking-code">{order.seller_shipping.tracking_number}</span>
                            </div>
                          )}
                          {order.seller_shipping.shipping_carrier && (
                            <div className="tracking-field">
                              <span className="field-label">Carrier:</span>
                              <span className="carrier-name">{order.seller_shipping.shipping_carrier}</span>
                            </div>
                          )}
                          {order.seller_shipping.shipped_at && (
                            <div className="tracking-field">
                              <span className="field-label">Shipped:</span>
                              <span className="date-value">{new Date(order.seller_shipping.shipped_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          {order.processed_at && (
                            <div className="tracking-field">
                              <span className="field-label">Processed:</span>
                              <span className="date-value">{new Date(order.processed_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cancellation Information */}
                    {order.status === 'cancelled' && order.cancellation_reason && (
                      <div className="cancellation-section">
                        <h5>❌ Cancellation Details</h5>
                        <div className="cancellation-details">
                          <div className="cancellation-field">
                            <span className="field-label">Reason:</span>
                            <p className="cancellation-reason">{order.cancellation_reason}</p>
                          </div>
                          {order.cancelled_at && (
                            <div className="cancellation-field">
                              <span className="field-label">Cancelled:</span>
                              <span className="date-value">{new Date(order.cancelled_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          {order.cancelled_by && (
                            <div className="cancellation-field">
                              <span className="field-label">By:</span>
                              <span className="username-value">{order.cancelled_by.username}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items Preview - ProductCard Style */}
                  <div className="items-preview">
                    <h4>📦 Your Items ({order.items.length})</h4>
                    <div className="items-grid">
                      {order.items.map((item, index) => (
                        <div key={index} className="item-preview">
                          <div className="item-info">
                            <span className="item-name">{item.product_name}</span>
                            <span className="item-quantity">{item.quantity}x</span>
                          </div>
                          <div className="item-price">
                            <span className="price">${item.total_price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-totals">
                      <div className="total-line">
                        <span className="total-label">Your Items Total:</span>
                        <span className="total-amount">${order.seller_items_total?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="total-note">
                        <small>Full Order Total: ${order.total_amount}</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer - ProductCard Style */}
                <div className="order-footer">
                  <div className="policy-info">
                    <p><strong>ℹ️ Policy:</strong> You manage only YOUR items. Other sellers handle theirs separately.</p>
                  </div>
                  
                  <div className="order-actions">
                    {/* Process Order - For pending orders */}
                    {order.status === 'pending' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => processOrder(order.id)}
                        disabled={updatingOrders.has(order.id)}
                        title="Move order to processing status"
                      >
                        {updatingOrders.has(order.id) ? '⏳ Processing...' : '⚡ Process Order'}
                      </button>
                    )}


                    {/* Tracking Section - For confirmed/processing orders */}
                    {['confirmed', 'processing'].includes(order.status) && (
                      <div className="tracking-action-section">
                        <button
                          className="btn btn-primary"
                          onClick={() => toggleTrackingForm(order.id)}
                          disabled={updatingOrders.has(order.id)}
                        >
                          {showTrackingForm.has(order.id) 
                            ? '❌ Cancel' 
                            : order.seller_shipping?.tracking_number 
                              ? '📦 Update Tracking' 
                              : '📦 Add Tracking'}
                        </button>
                          
                        {showTrackingForm.has(order.id) && (
                          <div className="tracking-form">
                            <div className="form-header">
                              <h5>📦 {order.seller_shipping?.tracking_number ? 'Update' : 'Add'} Tracking Information</h5>
                            </div>
                            
                            <div className="form-notice">
                              <p>ℹ️ <strong>Rule:</strong> Each seller can add ONE tracking code per order.</p>
                            </div>
                            
                            <div className="form-fields">
                              <div className="form-group">
                                <label>Tracking Number:</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder={order.seller_shipping?.tracking_number || "Enter tracking number..."}
                                  value={trackingData[order.id]?.trackingNumber || order.seller_shipping?.tracking_number || ''}
                                  onChange={(e) => handleTrackingDataChange(order.id, 'trackingNumber', e.target.value)}
                                />
                              </div>
                              <div className="form-group">
                                <label>Carrier (optional):</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g., CTT, DHL, UPS..."
                                  value={trackingData[order.id]?.carrier || order.seller_shipping?.shipping_carrier || ''}
                                  onChange={(e) => handleTrackingDataChange(order.id, 'carrier', e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <button
                              className="btn btn-success"
                              onClick={() => updateTrackingNumber(order.id)}
                              disabled={updatingOrders.has(order.id)}
                            >
                              {updatingOrders.has(order.id) 
                                ? (order.seller_shipping?.tracking_number ? '⏳ Updating...' : '⏳ Adding...') 
                                : (order.seller_shipping?.tracking_number ? '✅ Update Tracking' : '✅ Add & Ship')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cancel Section - For pending/confirmed orders */}
                    {['pending', 'confirmed'].includes(order.status) && (
                      <div className="cancel-action-section">
                        <button
                          className="btn btn-danger"
                          onClick={() => toggleCancelForm(order.id)}
                          disabled={updatingOrders.has(order.id)}
                          title="Cancel this order with reason"
                        >
                          {showCancelForm.has(order.id) ? '❌ Cancel' : '❌ Cancel Order'}
                        </button>

                        {showCancelForm.has(order.id) && (
                          <div className="cancel-form">
                            <div className="form-header">
                              <h5>❌ Cancel Order</h5>
                            </div>
                            
                            <div className="form-fields">
                              <div className="form-group">
                                <label>Cancellation Reason:</label>
                                <textarea
                                  className="form-control"
                                  placeholder="Please provide a reason for cancelling this order..."
                                  value={cancelData[order.id]?.reason || ''}
                                  onChange={(e) => handleCancelDataChange(order.id, e.target.value)}
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            <button
                              className="btn btn-danger"
                              onClick={() => cancelOrderWithReason(order.id)}
                              disabled={updatingOrders.has(order.id)}
                            >
                              {updatingOrders.has(order.id) ? '⏳ Cancelling...' : '⚠️ Confirm Cancellation'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status Messages */}
                    {!['pending', 'confirmed'].includes(order.status) && order.status !== 'cancelled' && (
                      <div className="status-info cannot-cancel">
                        <span>⚠️ Order cannot be cancelled once {order.status}</span>
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="status-info cancelled">
                        <span>❌ Order Cancelled</span>
                      </div>
                    )}

                    {updatingOrders.has(order.id) && (
                      <div className="processing-status">
                        <span>⏳ Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              ))}
            
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserOrdersManagement;