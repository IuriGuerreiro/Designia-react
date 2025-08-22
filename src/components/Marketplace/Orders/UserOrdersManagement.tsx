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
      console.log('awaiting_shipment order:', orderId);
      // Use the new validated endpoint to move to awaiting_shipment status
      const response = await orderService.updateOrderStatusValidated(orderId, 'awaiting_shipment');
      
      // Update the order in the local state
      setOrders(prev => prev.map(o => 
        o.id === orderId ? response.order : o
      ));

      alert(`${response.message}! Status updated from ${response.previous_status} to ${response.new_status}`);
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
      
      // Only update cancellation metadata, not order status (will be updated by webhook)
      setOrders(prev => prev.map(o => 
        o.id === orderId ? {
          ...o,
          cancelled_at: response.order.cancelled_at,
          cancellation_reason: response.order.cancellation_reason
        } : o
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

      // Show success message with refund information
      const successMessage = response.refund_requested 
        ? `Cancellation request submitted! Refund of $${response.refund_amount} will be processed and appear in the customer's account. Order status will update once the refund is confirmed.`
        : 'Order cancelled successfully!';
      
      alert(successMessage);
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
      case 'pending_payment': return '#fbbf24';
      case 'payment_confirmed': return '#06d6a0';
      case 'awaiting_shipment': return '#8b5cf6';
      case 'shipped': return '#f59e0b';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'refunded': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

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
        {/* Header Section - Matching MyOrdersPage Style */}
        <div className="orders-header">
          <h1 className="orders-title">Order Management</h1>
        </div>

        {error && (
          <div className="orders-error-state">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Unable to Load Orders</h3>
            <p className="error-description">{error}</p>
            <button onClick={loadOrders} className="error-retry-btn">
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Status Tabs - Matching MyOrdersPage Design */}
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


        {filteredOrders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-title">No Orders to Fulfill</h3>
            <p className="empty-description">
              {filterStatus === 'all' 
                ? "You don't have any orders to fulfill as a seller yet. Orders will appear here when customers purchase your products." 
                : `No orders found with status "${filterStatus}". Try a different filter to see more orders.`
              }
            </p>
          </div>
        ) : (
          <div className="orders-list-container">
            <div className="orders-count">
              <span className="count-text">Showing {filteredOrders.length} of {orders.length} orders</span>
            </div>
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-content-row">
                    {/* Product Images - Matching MyOrdersPage */}
                    <div className="order-images-section">
                      {order.items.slice(0, 3).map((item, index) => {
                        // Enhanced image URL resolution for order items
                        // Prioritize stored product_image but add fallback logic
                        let imageUrl = '/placeholder-product.png';
                        
                        if (item.product_image && item.product_image !== 'null' && item.product_image !== '') {
                          imageUrl = item.product_image;
                        }
                        
                        console.log('=== USER ORDERS MANAGEMENT - ORDER ITEM IMAGE DEBUG ===');
                        console.log('Order ID:', order.id);
                        console.log('Item:', item.product_name);
                        console.log('Stored product_image:', item.product_image);
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
                              if (target.src !== '/placeholder-product.png') {
                                console.log('Image failed to load, using placeholder:', target.src);
                                target.src = '/placeholder-product.png';
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
                    
                    {/* Order Number & Date - Matching MyOrdersPage */}
                    <div className="order-id-section">
                      <div className="order-number">
                        <span className="order-prefix">Order</span>
                        <span className="order-id">#{order.id.slice(-8)}</span>
                      </div>
                      <div className="order-date">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="item-count">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Customer & Status Info */}
                    <div className="order-customer-section">
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {order.buyer.first_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="customer-details">
                          <div className="customer-name">{order.buyer.first_name} {order.buyer.last_name}</div>
                          <div className="customer-username">@{order.buyer.username}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="order-status-section">
                      <span 
                        className="order-status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status === 'pending_payment' ? 'Pending Payment' :
                         order.status === 'payment_confirmed' ? 'Payment Confirmed' :
                         order.status === 'awaiting_shipment' ? 'Awaiting Shipment' :
                         order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <div className="order-total">
                        ${order.total_amount}
                      </div>
                    </div>

                    {/* Quick Actions - Matching MyOrdersPage Style */}
                    <div className="order-actions-section">
                      <div className="quick-actions">
                        {/* Process Order - Only for payment_confirmed orders */}
                        {order.status === 'payment_confirmed' && (
                          <button
                            className="action-btn primary-btn"
                            onClick={() => processOrder(order.id)}
                            disabled={updatingOrders.has(order.id)}
                            title="Start Processing Order"
                          >
                            {updatingOrders.has(order.id) ? '⏳' : '⚡'}
                          </button>
                        )}

                        {/* Tracking Button */}
                        {['awaiting_shipment'].includes(order.status) && (
                          <button
                            className="action-btn secondary-btn"
                            onClick={() => toggleTrackingForm(order.id)}
                            disabled={updatingOrders.has(order.id)}
                            title={order.seller_shipping?.tracking_number ? 'Update Tracking' : 'Add Tracking'}
                          >
                            📦
                          </button>
                        )}

                        {/* Cancel Button */}
                        {['payment_confirmed', 'awaiting_shipment'].includes(order.status) && (
                          <button
                            className="action-btn danger-btn"
                            onClick={() => toggleCancelForm(order.id)}
                            disabled={updatingOrders.has(order.id)}
                            title="Cancel Order"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                      
                      {/* View Details Button */}
                      <button 
                        className="view-details-btn"
                        onClick={() => {/* Add view details logic */}}
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Expanded Forms */}
                  {(showTrackingForm.has(order.id) || showCancelForm.has(order.id)) && (
                    <div className="order-expanded-section">
                      {/* Tracking Form */}
                      {showTrackingForm.has(order.id) && (
                        <div className="expanded-form tracking-form">
                          <h4>📦 {order.seller_shipping?.tracking_number ? 'Update' : 'Add'} Tracking</h4>
                          <div className="form-fields">
                            <div className="form-group">
                              <label>Tracking Number:</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter tracking number..."
                                value={trackingData[order.id]?.trackingNumber || order.seller_shipping?.tracking_number || ''}
                                onChange={(e) => handleTrackingDataChange(order.id, 'trackingNumber', e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Carrier:</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="e.g., CTT, DHL, UPS..."
                                value={trackingData[order.id]?.carrier || order.seller_shipping?.shipping_carrier || ''}
                                onChange={(e) => handleTrackingDataChange(order.id, 'carrier', e.target.value)}
                              />
                            </div>
                            <button
                              className="btn btn-success"
                              onClick={() => updateTrackingNumber(order.id)}
                              disabled={updatingOrders.has(order.id)}
                            >
                              {updatingOrders.has(order.id) ? '⏳ Updating...' : '✅ Save Tracking'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Cancel Form */}
                      {showCancelForm.has(order.id) && (
                        <div className="expanded-form cancel-form">
                          <h4>❌ Cancel Order</h4>
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
                            <button
                              className="btn btn-danger"
                              onClick={() => cancelOrderWithReason(order.id)}
                              disabled={updatingOrders.has(order.id)}
                            >
                              {updatingOrders.has(order.id) ? '⏳ Cancelling...' : '⚠️ Confirm Cancel'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserOrdersManagement;