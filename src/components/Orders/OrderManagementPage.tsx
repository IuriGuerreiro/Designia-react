import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import { orderService } from '../../services';
import { type Order } from '../../types/marketplace';
import './Orders.css';

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await orderService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (!orderService.canCancelOrder(order)) {
      alert(`Order cannot be cancelled. Current status: ${order.status}. Orders can only be cancelled when they are 'pending' or 'confirmed'.`);
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setUpdatingOrders(prev => new Set([...prev, orderId]));
    try {
      const updatedOrder = await orderService.cancelOrder(orderId);
      setOrders(prev => prev.map(o => 
        o.id === orderId ? updatedOrder : o
      ));
      alert('Order cancelled successfully.');
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
        <div className="page-header">
          <h1>Order Management</h1>
          <p>View and track orders - Orders can only be cancelled (immutable after finalization)</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadOrders} className="btn btn-sm">
              Try Again
            </button>
          </div>
        )}

        <div className="order-filters">
          <h3>Filter by Status</h3>
          <div className="filter-buttons">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="count">({count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="orders-container">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <h3>No Orders Found</h3>
              <p>
                {filterStatus === 'all' 
                  ? "You don't have any orders yet." 
                  : `No orders with status "${filterStatus}".`
                }
              </p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h4>Order #{order.id}</h4>
                      <p className="order-date">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="buyer-info">
                      <h5>Buyer Information</h5>
                      <p><strong>{order.buyer.first_name} {order.buyer.last_name}</strong></p>
                      <p>@{order.buyer.username}</p>
                    </div>

                    <div className="shipping-info">
                      <h5>Shipping Address</h5>
                      <p>{order.shipping_address.name}</p>
                      <p>{order.shipping_address.street}</p>
                      <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                    </div>

                    <div className="order-items">
                      <h5>Items ({order.items.length})</h5>
                      <div className="items-summary">
                        {order.items.map((item, index) => (
                          <div key={index} className="item-summary">
                            <span>{item.product_name}</span>
                            <span>Qty: {item.quantity}</span>
                            <span>${item.total_price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="order-total">
                      <strong>Total: ${order.total_amount}</strong>
                    </div>
                  </div>

                  <div className="order-actions">
                    <h5>Order Management</h5>
                    <div className="order-policy-info">
                      <p className="policy-note">
                        📋 <strong>Order Policy:</strong> Orders are immutable after finalization. Only cancellation is allowed for orders in 'pending' or 'confirmed' status.
                      </p>
                    </div>
                    
                    <div className="status-actions">
                      {orderService.canCancelOrder(order) && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => cancelOrder(order.id)}
                          disabled={updatingOrders.has(order.id)}
                          title="Cancel this order (only available for pending and confirmed orders)"
                        >
                          Cancel Order
                        </button>
                      )}

                      {!orderService.canCancelOrder(order) && order.status !== 'cancelled' && (
                        <div className="cannot-cancel-info">
                          <span className="order-status-info">
                            ⚠️ Order cannot be cancelled once {order.status}
                          </span>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="cancelled-info">
                          <span className="cancelled-badge">❌ Order Cancelled</span>
                        </div>
                      )}

                      {updatingOrders.has(order.id) && (
                        <div className="updating-status">
                          <span>Processing cancellation...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderManagementPage;