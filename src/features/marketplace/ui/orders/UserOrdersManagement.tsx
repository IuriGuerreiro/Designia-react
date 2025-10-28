import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/app/layout';
import { orderService } from '@/features/marketplace/api';
import { type Order } from '@/features/marketplace/model';
import './Orders.css';

const UserOrdersManagement: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [showTrackingForm, setShowTrackingForm] = useState<Set<string>>(new Set());
  const [showCancelForm, setShowCancelForm] = useState<Set<string>>(new Set());
  const [trackingData, setTrackingData] = useState<{[orderId: string]: {trackingNumber: string, carrier: string}}>({});
  const [cancelData, setCancelData] = useState<{[orderId: string]: {reason: string}}>({});

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
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await orderService.getSellerOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load seller orders:', err);
      setError(err instanceof Error ? err.message : t('orders.errors.unable_to_load'));
    } finally {
      setLoading(false);
    }
  };

  const toggleTrackingForm = (orderId: string) => {
    setShowTrackingForm(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const handleTrackingDataChange = (orderId: string, field: 'trackingNumber' | 'carrier', value: string) => {
    setTrackingData(prev => ({ ...prev, [orderId]: { ...prev[orderId], [field]: value } }));
  };

  const toggleCancelForm = (orderId: string) => {
    setShowCancelForm(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const handleCancelDataChange = (orderId: string, reason: string) => {
    setCancelData(prev => ({ ...prev, [orderId]: { reason } }));
  };

  const processOrder = async (orderId: string) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId));
    try {
      const response = await orderService.updateOrderStatusValidated(orderId, 'awaiting_shipment');
      setOrders(prev => prev.map(o => o.id === orderId ? response.order : o));
      alert(response.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process order.');
    } finally {
      setUpdatingOrders(prev => { const newSet = new Set(prev); newSet.delete(orderId); return newSet; });
    }
  };

  const cancelOrderWithReason = async (orderId: string) => {
    const { reason } = cancelData[orderId] || {};
    if (!reason) {
      alert(t('orders.cancel.provide_reason'));
      return;
    }
    if (!window.confirm(t('orders.cancel.confirm_with_reason', { reason }))) return;

    setUpdatingOrders(prev => new Set(prev).add(orderId));
    try {
      const response = await orderService.cancelOrderWithReason(orderId, reason);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...response.order } : o));
      toggleCancelForm(orderId);
      alert(response.refund_requested ? t('orders.cancel.refund_requested', { amount: response.refund_amount }) : t('orders.cancel.success'));
    } catch (err) {
      alert(err instanceof Error ? err.message : t('orders.cancel.error'));
    } finally {
      setUpdatingOrders(prev => { const newSet = new Set(prev); newSet.delete(orderId); return newSet; });
    }
  };

  const updateTrackingNumber = async (orderId: string) => {
    const data = trackingData[orderId];
    if (!data?.trackingNumber) {
      alert('Please enter a tracking number.');
      return;
    }

    setUpdatingOrders(prev => new Set(prev).add(orderId));
    try {
      const response = await orderService.updateTracking(orderId, data.trackingNumber, data.carrier);
      setOrders(prev => prev.map(o => o.id === orderId ? response.order : o));
      toggleTrackingForm(orderId);
      alert(response.message);
      await loadOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add tracking number.');
    } finally {
      setUpdatingOrders(prev => { const newSet = new Set(prev); newSet.delete(orderId); return newSet; });
    }
  };

  const getStatusClass = (status: string) => {
    return `status-${status.toLowerCase()}`;
  };

  // Helper function to clean search term
  const cleanSearchTerm = (term: string) => {
    return term
      .toLowerCase()
      .replace(/^order\s*/i, '') // Remove "order" from beginning
      .replace(/#/g, '') // Remove all # symbols
      .trim();
  };

  // Helper function to check if search term looks like an order ID
  const isOrderIdSearch = (term: string) => {
    const cleaned = cleanSearchTerm(term);
    // If it contains numbers, treat it as order ID search
    return /\d/.test(cleaned);
  };

  // Filter orders by status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    if (searchTerm === '') return matchesStatus;
    
    const cleanedSearch = cleanSearchTerm(searchTerm);
    if (cleanedSearch === '') return matchesStatus;
    
    const matchesSearch = 
      order.id.toLowerCase().includes(cleanedSearch) ||
      order.items.some(item => item.product_name.toLowerCase().includes(cleanedSearch)) ||
      `${order.buyer.first_name} ${order.buyer.last_name}`.toLowerCase().includes(cleanedSearch);
    
    return matchesStatus && matchesSearch;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  if (loading) {
    return (
      <Layout>
        <div className="orders-management-container">
          {/* Header Section */}
          <div className="management-header">
            <h1 className="management-title">{t('orders.management.title')}</h1>
            <p className="management-subtitle">{t('orders.management.subtitle')}</p>
          </div>
          
          {/* Skeleton Loading */}
          <div className="management-skeleton">
            {[1, 2, 3].map((index) => (
              <div key={index} className="skeleton-management-card">
                <div className="skeleton-management-header">
                  <div>
                    <div className="skeleton-order-id"></div>
                    <div className="skeleton-order-date"></div>
                  </div>
                  <div className="skeleton-management-status"></div>
                </div>
                
                <div className="skeleton-management-body">
                  <div className="skeleton-items-preview">
                    <div className="skeleton-items-images">
                      <div className="skeleton-item-image"></div>
                      <div className="skeleton-item-image"></div>
                      <div className="skeleton-item-image"></div>
                    </div>
                    <div className="skeleton-items-summary">
                      <div className="skeleton-text-line short"></div>
                      <div className="skeleton-text-line medium"></div>
                    </div>
                  </div>
                  <div className="skeleton-actions">
                    <div className="skeleton-button"></div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="orders-management-container">
        {/* Header Section */}
        <div className="management-header">
          <h1 className="management-title">{t('orders.management.title')}</h1>
          <p className="management-subtitle">{t('orders.management.subtitle')}</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="management-error">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="orders-search-container">
          <div className="search-input-wrapper">
            <input
              className="orders-search-input"
              type="text"
              placeholder={t('orders.search.placeholder_management')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="search-icon">🔍</div>
          </div>
          {searchTerm && (
            <div className="search-info">
              <small className="search-hint">
                {t('orders.search.searching_for', { term: cleanSearchTerm(searchTerm) })}
                {searchTerm !== cleanSearchTerm(searchTerm) && (
                  <span className="search-cleanup"> {t('orders.search.cleaned_from', { term: searchTerm })}</span>
                )}
              </small>
            </div>
          )}
        </div>

        {/* Status Filter Tabs */}
        {orders.length > 0 && (
          <div className="management-status-tabs">
            {['all', 'payment_confirmed', 'awaiting_shipment', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`management-status-tab ${filterStatus === status ? 'active-management-tab' : ''}`}
              >
                {t(`orders.status_type.${status}`)} ({statusCounts[status] || 0})
              </button>
            ))}
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="empty-icon">📦</div>
            <h3 className="empty-title">{t('orders.empty.no_orders_found')}</h3>
            <p className="empty-description">
              {searchTerm 
                ? t('orders.empty.none_with_search', { term: searchTerm })
                : filterStatus === 'all' 
                  ? t('orders.empty.you_have_none') 
                  : t('orders.empty.none_with_status', { status: filterStatus })
              }
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="clear-filters-btn"
              >
                {t('orders.actions.clear_search')}
              </button>
            )}
          </div>
        ) : (
          <div className="orders-list-container">
            <div className="orders-count">
              <span className="count-text">{t('orders.count_showing', { shown: filteredOrders.length, total: orders.length })}</span>
            </div>
            <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                {/* Card Header */}
                <div className="card-header">
                  <div>
                    <h3 className="order-id">{t('orders.order_id')} #{order.id.slice(-8)}</h3>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="order-total">
                    <p className="total-label">{t('orders.total')}</p>
                    <p className="total-amount">${order.total_amount}</p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <div className="order-images">
                    {order.items.slice(0, 3).map((item, index) => {
                      const imageUrl = getBestImageUrl(item);
                      
                      return (
                        <img 
                          key={index} 
                          src={imageUrl}
                          alt={item.product_name} 
                          className="order-item-image"
                          onError={(e) => {
                            console.warn(`Image failed to load for ${item.product_name}, falling back to placeholder`);
                            e.currentTarget.src = '/placeholder-product.svg';
                          }}
                        />
                      );
                    })}
                    {order.items.length > 3 && (
                      <div className="order-item-overflow">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="order-items-summary">
                    <p className="items-count">{order.items.length} item{order.items.length > 1 ? 's' : ''} {t('orders.items_including')}</p>
                    <p className="items-list">
                      {order.items.slice(0, 2).map(item => item.product_name).join(', ')}
                      {order.items.length > 2 && t('orders.and_more', { count: order.items.length - 2 })}
                    </p>
                    <p className="buyer-info">{t('orders.management.for_label')} {order.buyer.first_name} {order.buyer.last_name}</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer">
                  <div className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </div>
                  <div className="order-actions">
                    {order.status === 'payment_confirmed' && (
                      <button 
                        onClick={() => processOrder(order.id)} 
                        disabled={updatingOrders.has(order.id)}
                        className="retry-payment-btn"
                      >
                        {updatingOrders.has(order.id) ? t('orders.actions.processing') : t('orders.actions.process_order')}
                      </button>
                    )}
                    {['awaiting_shipment', 'shipped'].includes(order.status) && (
                      <button 
                        onClick={() => toggleTrackingForm(order.id)}
                        className="btn-tracking"
                      >
                        {order.seller_shipping?.tracking_number ? t('orders.actions.update_tracking') : t('orders.actions.add_tracking')}
                      </button>
                    )}
                    {['payment_confirmed', 'awaiting_shipment'].includes(order.status) && (
                      <button 
                        onClick={() => toggleCancelForm(order.id)}
                        className="cancel-order-btn"
                      >
                        {t('orders.actions.cancel_order')}
                      </button>
                      )}
                  </div>
                </div>

                {/* Expanded Forms */}
                {(showTrackingForm.has(order.id) || showCancelForm.has(order.id)) && (
                  <div className="management-forms-section">
                    {showTrackingForm.has(order.id) && (
                      <div className="tracking-form-section">
                        <h4 className="form-section-title">{t('orders.detail.shipping_tracking')}</h4>
                        <div className="tracking-form-grid">
                          <input 
                            type="text" 
                            placeholder={t('orders.detail.tracking_number')}
                            defaultValue={order.seller_shipping?.tracking_number || ''}
                            onChange={(e) => handleTrackingDataChange(order.id, 'trackingNumber', e.target.value)}
                            className="tracking-input"
                          />
                          <input 
                            type="text" 
                            placeholder={t('orders.detail.carrier')}
                            defaultValue={order.seller_shipping?.shipping_carrier || ''}
                            onChange={(e) => handleTrackingDataChange(order.id, 'carrier', e.target.value)}
                            className="tracking-input"
                          />
                          <button 
                            onClick={() => updateTrackingNumber(order.id)} 
                            disabled={updatingOrders.has(order.id)}
                            className="btn-save-tracking"
                          >
                            {t('orders.actions.save')}
                          </button>
                        </div>
                      </div>
                    )}
                    {showCancelForm.has(order.id) && (
                      <div className="cancel-form-section">
                        <h4 className="form-section-title">{t('orders.actions.cancel_order')}</h4>
                        <textarea 
                          placeholder="Reason for cancellation..."
                          onChange={(e) => handleCancelDataChange(order.id, e.target.value)}
                          rows={3}
                          className="cancel-reason-textarea"
                        />
                        <button 
                          onClick={() => cancelOrderWithReason(order.id)} 
                          disabled={updatingOrders.has(order.id)}
                          className="btn-confirm-cancellation"
                        >
                          {t('orders.actions.confirm_cancellation')}
                        </button>
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
