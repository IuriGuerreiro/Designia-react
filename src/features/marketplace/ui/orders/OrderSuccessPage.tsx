import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { orderService } from '@/features/marketplace/api';
import { type Order } from '@/features/marketplace/model';
import styles from './Orders.module.css';

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useTranslation();
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
        <div className={styles['order-success-loading']}>
          <div className={styles['loading-spinner']}></div>
          <p className={styles['loading-text']}>{t('orders.detail.loading_details')}</p>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className={styles['order-success-error']}>
          <div className={styles['error-icon']}>⚠️</div>
          <h2 className={styles['error-title']}>{t('orders.detail.not_found_title')}</h2>
          <p className={styles['error-description']}>{error || t('orders.detail.not_found_message')}</p>
          <Link to="/my-orders" className={styles['btn-primary']}>{t('orders.success.view_my_orders')}</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['order-success-page']}>
        {/* Success Header */}
        <div className={styles['success-header']}>
          <div className={styles['success-icon']}>✅</div>
          <h1 className={styles['success-title']}>{t('orders.success.title')}</h1>
          <p className={styles['success-subtitle']}>{t('orders.success.subtitle', { id: order.id })}</p>
        </div>

        {/* Order Content Layout */}
        <div className={styles['order-success-layout']}>
          {/* Order Items Column */}
          <div className={styles['order-items-column']}>
            <div className={styles['section-header']}>
              <h3 className={styles['section-title']}>{t('orders.success.items_ordered')}</h3>
              <span className={styles['item-count-badge']}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
            </div>
            <div className={styles['order-items-list']}>
              {order.items.map((item) => {
                const imageUrl = getBestImageUrl(item);
                
                return (
                  <div key={item.id} className={styles['order-item-card']}>
                    <div className={styles['item-image-container']}>
                      <img 
                        src={imageUrl}
                        alt={item.product_name}
                        className={styles['item-image']}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.warn(`Image failed to load for ${item.product_name}, falling back to placeholder`);
                          if (target.src !== '/placeholder-product.svg') {
                            target.src = '/placeholder-product.svg';
                          }
                        }}
                      />
                      <div className={styles['quantity-badge']}>{item.quantity}</div>
                    </div>
                    <div className={styles['item-details']}>
                      <h4 className={styles['item-name']}>{item.product_name}</h4>
                      <div className={styles['item-meta']}>
                        <span className={styles['item-quantity']}>Qty: {item.quantity}</span>
                        <span className={styles['item-unit-price']}>${item.unit_price}</span>
                      </div>
                    </div>
                    <div className={styles['item-total']}>
                      <span className={styles['total-label']}>{t('orders.total')}</span>
                      <span className={styles['total-amount']}>${item.total_price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Column */}
          <div className={styles['order-summary-column']}>
            {/* Order Summary Card */}
            <div className={styles['summary-card']}>
              <h3 className={styles['summary-title']}>{t('orders.detail.order_summary')}</h3>
              <div className={styles['summary-breakdown']}>
                <div className={styles['summary-row']}>
                  <span className={styles['summary-label']}>{t('checkout.subtotal_label')}:</span>
                  <span className={styles['summary-value']}>${order.subtotal}</span>
                </div>
                <div className={styles['summary-row']}>
                  <span className={styles['summary-label']}>{t('checkout.shipping_label')}:</span>
                  <span className={styles['summary-value']}>${order.shipping_cost}</span>
                </div>
                <div className={styles['summary-divider']}></div>
                <div className={`${styles['summary-row']} ${styles['final-total']}`}>
                  <span className={styles['summary-label']}>{t('checkout.total_label')}:</span>
                  <span className={styles['summary-value']}>${order.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className={styles['shipping-card']}>
              <h3 className={styles['shipping-title']}>{t('orders.success.shipping_to')}</h3>
              <div className={styles['shipping-address']}>
                <p className={styles['recipient-name']}>{order.shipping_address.name}</p>
                <p className={styles['street-address']}>{order.shipping_address.street}</p>
                <p className={styles['city-state-zip']}>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/products" className="btn-primary">
            🛍️ {t('orders.success.continue_shopping')}
          </Link>
          <Link to="/my-orders" className="btn-secondary">
            📋 {t('orders.success.view_all_orders')}
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccessPage;
