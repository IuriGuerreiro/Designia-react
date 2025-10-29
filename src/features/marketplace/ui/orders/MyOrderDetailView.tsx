import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { useTranslation } from 'react-i18next';
import { orderService } from '@/features/marketplace/api';
import { type Order } from '@/features/marketplace/model';
import styles from './Orders.module.css';

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
        <div className={styles['order-detail-loading']}>
          <div className={styles['loading-spinner']}></div>
          <p className={styles['loading-text']}>{t('orders.detail.loading_details')}</p>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className={styles['order-detail-error']}>
          <div className={styles['error-icon']}>⚠️</div>
          <h3 className={styles['error-title']}>{t('orders.detail.not_found_title')}</h3>
          <p className={styles['error-description']}>{error || t('orders.detail.not_found_message')}</p>
          <Link to="/my-orders" className={styles['back-to-orders-btn']}>
            ← {t('orders.detail.back_to_orders')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['order-detail-container']}>
        {/* Premium Breadcrumb */}
        <div className={styles['order-detail-breadcrumb']}>
          <Link to="/my-orders" className={styles['breadcrumb-link']}>
            <span className={styles['breadcrumb-icon']}>←</span>
            <span className={styles['breadcrumb-text']}>{t('orders.detail.back_to_orders')}</span>
          </Link>
        </div>

        {/* Premium Order Header */}
        <div className={styles['order-detail-header']}>
          <div className={styles['header-content']}>
            <div className={styles['order-title-section']}>
              <div className={styles['order-id-display']}>
                <span className={styles['order-label']}>Order Number</span>
                <h1 className={styles['order-number']}>#{order.id.slice(-8)}</h1>
              </div>
              <div className={styles['order-date-info']}>
                <span className={styles['date-label']}>Order Placed</span>
                <span className={styles['order-date']}>{formatOrderDate(order.created_at)}</span>
              </div>
            </div>
            
            <div className={styles['header-status-section']}>
              <div className={`${styles['status-badge']} ${styles[getStatusClass(order.status)]}`}>
                <span className={styles['status-icon']}>{getStatusIcon(order.status)}</span>
                <span className={styles['status-text']}>{order.status.replace('_', ' ')}</span>
              </div>
              <div className={styles['order-total-section']}>
                <span className={styles['total-label']}>Total Amount</span>
                <span className={styles['total-amount']}>${order.total_amount || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Order Items Section */}
        <div className={styles['order-detail-section']}>
          <div className={styles['section-header']}>
            <h2 className={styles['section-title']}>
              <span className={styles['section-icon']}>📦</span>
              Order Items
            </h2>
            <span className={styles['item-count-badge']}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
          </div>
          
          <div className={styles['order-items-grid']}>
            {order.items.map((item) => (
              <div key={item.id} className={styles['order-item-card']}>
                <div className={styles['item-image-container']}>
                  <img 
                    src={getBestImageUrl(item)}
                    alt={item.product_name}
                    className={styles['item-image']}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/placeholder-product.svg') {
                        target.src = '/placeholder-product.svg';
                      }
                    }}
                  />
                  <div className={styles['quantity-badge']}>{item.quantity}x</div>
                </div>
                
                <div className={styles['item-details']}>
                  <div className={styles['item-meta']}>
                    <span className={styles['seller-info']}>
                      <span className={styles['seller-icon']}>🏢</span>
                      <span className={styles['seller-name']}>{item.seller || t('orders.detail.unknown_seller')}</span>
                    </span>
                  </div>
                  <h3 className={styles['item-name']}>{item.product_name}</h3>
                  
                  <div className={styles['pricing-grid']}>
                    <div className={styles['price-detail']}>
                      <span className={styles['price-label']}>{t('orders.detail.unit_price')}</span>
                      <span className={styles['price-value']}>${item.unit_price}</span>
                    </div>
                    <div className={styles['price-detail']}>
                      <span className={styles['price-label']}>{t('orders.total')}</span>
                      <span className={`${styles['price-value']} ${styles['total-highlight']}`}>
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
          <div className={styles['order-detail-section']}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>
                <span className={styles['section-icon']}>🚚</span>
                {t('orders.detail.shipping_tracking')}
              </h2>
              <span className={styles['shipping-count-badge']}>{t('orders.detail.shipment_count', { count: order.shipping_info.length, suffix: order.shipping_info.length > 1 ? 's' : '' })}</span>
            </div>
            
            <div className={styles['shipping-list']}>
              {order.shipping_info.map((shipping, index) => (
                <div key={index} className={styles['shipping-card']}>
                  <div className={styles['shipping-header']}>
                    <div className={styles['seller-info']}>
                      <div className={styles['seller-avatar']}>
                        {shipping.seller.username.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles['seller-details']}>
                        <Link to={`/seller/${shipping.seller.id}`} className={styles['seller-name-link']}>
                          <h4 className={styles['seller-name']}>{shipping.seller.username}</h4>
                        </Link>
                        {shipping.shipped_at && (
                          <span className={styles['shipped-date']}>
                            {t('orders.detail.shipped_on', { date: new Date(shipping.shipped_at).toLocaleDateString() })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {shipping.tracking_number ? (
                    <div className={styles['tracking-info']}>
                      <div className={styles['tracking-detail']}>
                        <span className={styles['tracking-label']}>{t('orders.detail.tracking_number')}</span>
                        <div className={styles['tracking-number']}>{shipping.tracking_number}</div>
                      </div>
                      {shipping.shipping_carrier && (
                        <div className={styles['tracking-detail']}>
                          <span className={styles['tracking-label']}>{t('orders.detail.carrier')}</span>
                          <span className={styles['carrier-name']}>{shipping.shipping_carrier}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles['no-tracking']}>
                      <div className={styles['preparing-status']}>
                        <span>📦 {t('orders.detail.preparing_shipment')}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium Order Summary */}
        <div className={styles['order-detail-section']}>
          <div className={styles['section-header']}>
            <h2 className={styles['section-title']}>
              <span className={styles['section-icon']}>📋</span>
              {t('orders.detail.order_summary')}
            </h2>
          </div>
          
          <div className={styles['order-summary-card']}>
            <div className={styles['summary-row']}>
              <span className={styles['summary-label']}>{t('checkout.subtotal_label')}</span>
              <span className={styles['summary-value']}>${order.subtotal}</span>
            </div>
            <div className={styles['summary-row']}>
              <span className={styles['summary-label']}>{t('checkout.shipping_label')}</span>
              <span className={styles['summary-value']}>${order.shipping_cost}</span>
            </div>
            {order.tax_amount > 0 && (
              <div className={styles['summary-row']}>
                <span className={styles['summary-label']}>Tax</span>
                <span className={styles['summary-value']}>${order.tax_amount}</span>
              </div>
            )}
            {order.discount_amount > 0 && (
              <div className={styles['summary-row']}>
                <span className={styles['summary-label']}>Discount</span>
                <span className={`${styles['summary-value']} ${styles['discount-value']}`}>-${order.discount_amount}</span>
              </div>
            )}
            <div className={styles['summary-divider']}></div>
            <div className={`${styles['summary-row']} ${styles['final-total']}`}>
              <span className={styles['summary-label']}>{t('checkout.total_label')}</span>
              <span className={styles['summary-value']}>${order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyOrderDetailView;
