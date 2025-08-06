import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import { useTranslation } from 'react-i18next';
import './Orders.css';
import { Link } from 'react-router-dom';
import { orderService } from '../../services';
import { type Order } from '../../types/marketplace';

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div className="page-header">
          <h2 className="page-title">{t('orders.title')}</h2>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        )}
        
        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item) => (
                    <img 
                      key={item.id} 
                      src={item.product_image || '/placeholder-product.png'} 
                      alt={item.product_name} 
                      className="product-thumbnail" 
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="more-items">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="order-details">
                  <div className="order-info">
                    <h4>{t('orders.order_id')} #{order.id}</h4>
                    <p>{t('orders.date')}: {formatOrderDate(order.created_at)}</p>
                  </div>
                  <div className="order-total">
                    <p>
                      { order.total_amount
                        ? order.total_amount
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-actions">
                    <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
                      {t('orders.view_details')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders-message">
            <h3>{t('orders.no_orders')}</h3>
            <p>{t('orders.browse_products_prompt')}</p>
            <Link to="/" className="btn btn-primary btn-lg">{t('orders.browse_products')}</Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;