import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { orderService } from '../../../services';
import { type Order } from '../../../types/marketplace';
import './Orders.css';

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return <Layout><div className="loading-message">Loading order details...</div></Layout>;
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="error-container">
          <h2>Order Not Found</h2>
          <p>{error || 'The order could not be found.'}</p>
          <Link to="/my-orders" className="btn btn-primary">View My Orders</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="order-success-page">
        <div className="success-header">
          <h1>✅ Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order #{order.id} has been confirmed.</p>
        </div>

        <div className="order-success-layout">
          <div className="order-items-column">
            <h3>Items Ordered</h3>
            {order.items.map((item) => (
              <div key={item.id} className="order-item-card">
                <img 
                  src={item.product_image || '/placeholder-product.png'} 
                  alt={item.product_name}
                  className="item-image"
                />
                <div className="item-details">
                  <h4>{item.product_name}</h4>
                  <p>Qty: {item.quantity}</p>
                  <p>${item.unit_price}</p>
                </div>
                <div className="item-total">
                  ${item.total_price}
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary-column">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${order.subtotal}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>${order.shipping_cost}</span>
              </div>
              <div className="total-row final-total">
                <span>Total:</span>
                <span>${order.total_amount}</span>
              </div>
            </div>
            <div className="summary-card">
              <h3>Shipping To</h3>
              <p><strong>{order.shipping_address.name}</strong></p>
              <p>{order.shipping_address.street}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
            </div>
          </div>
        </div>
        <div className="action-buttons">
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          <Link to="/my-orders" className="btn btn-secondary">View All Orders</Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccessPage;
