import React, { useState, useEffect } from 'react';
import { Layout } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { orderService } from '@/features/marketplace/api';
import { type Order } from '@/features/marketplace/model';
import ViewSellerAccount from '@/features/marketplace/ui/seller/ViewSellerAccount';
import './Orders.css';

const MyOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

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
    
    const reason = window.prompt(t('orders.cancel.provide_reason') + ':');
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
      alert(result.refund_requested
        ? t('orders.cancel.refund_requested', { amount: result.refund_amount })
        : t('orders.cancel.success'));
      
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err instanceof Error ? err.message : t('orders.cancel.error'));
    } finally {
      setCancellingOrderId(null);
    }
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
      order.items.some(item => item.product_name.toLowerCase().includes(cleanedSearch));
    
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
          {/* Header Section */}
          <div className="orders-header">
            <h1 className="orders-title">{t('orders.title')}</h1>
            <p className="orders-subtitle">{t('orders.subtitle')}</p>
          </div>
          
          {/* Skeleton Loading */}
          <div className="orders-skeleton">
            {[1, 2, 3].map((index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-header">
                  <div>
                    <div className="skeleton-order-id"></div>
                    <div className="skeleton-order-date"></div>
                  </div>
                  <div className="skeleton-total"></div>
                </div>
                
                <div className="skeleton-body">
                  <div className="skeleton-images">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-image"></div>
                    <div className="skeleton-image"></div>
                  </div>
                  <div className="skeleton-content">
                    <div className="skeleton-text-line short"></div>
                    <div className="skeleton-text-line medium"></div>
                  </div>
                </div>
                
                <div className="skeleton-footer">
                  <div className="skeleton-status"></div>
                  <div className="skeleton-button"></div>
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
      <div className="orders-container">
        {/* Header Section - Premium Design System */}
        <div className="orders-header">
          <h1 className="orders-title">{t('orders.title')}</h1>
          <p className="orders-subtitle">{t('orders.subtitle')}</p>
        </div>
        
        {/* Search Bar - Premium Design System */}
        <div className="orders-search-container">
          <div className="search-input-wrapper">
            <input
              className="orders-search-input"
              type="text"
              placeholder={t('orders.search.placeholder')}
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
                  <span className="search-cleanup">
                    {" "}{t('orders.search.cleaned_from', { term: searchTerm })}
                  </span>
                )}
              </small>
            </div>
          )}
        </div>
        
        {/* Status Tabs - Premium Design System */}
        {orders.length > 0 && (
          <div className="orders-status-tabs">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                className={`orders-status-tab ${filterStatus === status ? 'active-status-tab' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                <span className="status-tab-text">
                  {t(`orders.status_type.${status}`)} ({count})
                </span>
              </button>
            ))}
          </div>
        )}
        
        {error && (
          <div className="orders-error-state">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">{t('orders.errors.unable_to_load')}</h3>
            <p className="error-description">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="error-retry-btn"
            >
              🔄 {t('orders.actions.try_again')}
            </button>
          </div>
        )}
        
        {/* Order Cards - Premium Design System */}
        {filteredOrders.length > 0 ? (
          <div className="orders-list-container">
            <div className="orders-count">
              <span className="count-text">{t('orders.count_showing', { shown: filteredOrders.length, total: orders.length })}</span>
            </div>
            <div className="orders-list">
              {filteredOrders.map(order => (
                <Link key={order.id} to={`/my-orders/${order.id}`} className="order-card-link">
                  <div className="order-card">
                    {/* Card Header */}
                    <div className="card-header">
                      <div>
                        <h3 className="order-id">{t('orders.order_id')} #{order.id.slice(-8)}</h3>
                        <p className="order-date">{formatOrderDate(order.created_at)}</p>
                      </div>
                      <div className="order-total">
                        <p className="total-label">{t('orders.total')}</p>
                        <p className="total-amount">${order.total_amount || '0.00'}</p>
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
                      </div>
                      
                      {/* Seller Profile Preview */}
                      {order.items.length > 0 && order.items[0].seller_id && (
                        <div className="seller-preview">
                          <div className="seller-preview-header">
                            <span className="seller-label">Seller:</span>
                            <Link 
                              to={`/seller/${order.items[0].seller_id}`}
                              className="seller-name-link"
                            >
                              {order.items[0].seller_name || 'Designia Seller'}
                            </Link>
                          </div>
                          <ViewSellerAccount 
                            seller={{
                              id: order.items[0].seller_id || 1,
                              username: order.items[0].seller_name || 'designia_seller',
                              first_name: 'Jane',
                              last_name: 'Designer',
                              avatar: 'https://via.placeholder.com/60x60/0A0A0A/FFFFFF?text=JD',
                              bio: 'Professional furniture designer with expertise in creating beautiful pieces.',
                              job_title: 'Senior Furniture Designer',
                              company: 'Designia Studios',
                              is_verified_seller: true,
                              seller_type: 'Professional Designer',
                              profile_completion_percentage: 95,
                              created_at: '2023-01-15T00:00:00Z'
                            }}
                            showContactInfo={false}
                            showSocialMedia={false}
                            showProfessionalInfo={false}
                            className="mini-seller-view"
                          />
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="card-footer">
                      <div className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </div>
                      <div className="order-actions">
                        {order.status === 'pending_payment' && (
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/checkout?retry_order=${order.id}`; }}
                        className="retry-payment-btn"
                      >
                        {t('orders.actions.retry_payment')}
                      </button>
                    )}
                    {['pending_payment', 'payment_confirmed'].includes(order.status) && (
                      <button 
                        onClick={(e) => handleCancelOrder(order.id, e)}
                        disabled={cancellingOrderId === order.id}
                        className="cancel-order-btn"
                      >
                        {cancellingOrderId === order.id ? t('orders.actions.cancelling') : t('orders.actions.cancel_order')}
                      </button>
                    )}
                    <span className="view-details-btn">{t('orders.view_details')}</span>
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
            {orders.length === 0 ? t('orders.empty.no_orders_found') : t('orders.empty.no_matching_orders')}
          </h3>
          <p className="empty-description">
            {orders.length === 0 
              ? t('orders.browse_products_prompt')
              : searchTerm 
                ? t('orders.empty.none_with_search', { term: searchTerm })
                : t('orders.empty.none_with_status', { status: filterStatus })
            }
          </p>
          {orders.length === 0 && (
            <Link to="/" className="start-shopping-btn">
              🛍️ {t('orders.empty.start_shopping')}
            </Link>
          )}
          {orders.length > 0 && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} 
              className="clear-filters-btn"
            >
              {t('orders.actions.clear_filters')}
            </button>
          )}
        </div>
      )}
      </div>
    </Layout>
  );
};

export default MyOrdersPage;
