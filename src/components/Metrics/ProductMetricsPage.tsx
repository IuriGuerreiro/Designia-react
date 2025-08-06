import React from 'react';
import Layout from '../Layout/Layout';
import './Metrics.css';
import { useTranslation } from 'react-i18next';

const ProductMetricsPage: React.FC = () => {
  const { t } = useTranslation();
  // Placeholder data for a single product
  const product = {
    id: 1,
    name: 'Elegant Sofa',
    views: 1500,
    clicks: 300,
    wishlistAdds: 120,
    cartAdds: 80,
    sales: 15,
    revenue: 13499.85,
  };

  // Placeholder data for orders
  const orders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      date: '2023-10-27',
      shippingAddress: '123 Main St, Anytown, USA 12345',
      status: 'Pending Shipment',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      date: '2023-10-26',
      shippingAddress: '456 Oak Ave, Somecity, USA 67890',
      status: 'Shipped',
    },
    {
        id: 'ORD-003',
        customer: 'Peter Jones',
        date: '2023-10-25',
        shippingAddress: '789 Pine Ln, Otherville, USA 13579',
        status: 'Delivered',
    }
  ];

  const ctr = ((product.clicks / product.views) * 100).toFixed(2);
  const conversionRate = ((product.sales / product.clicks) * 100).toFixed(2);

  return (
    <Layout>
      <div className="metrics-page-container">
        <div className="metrics-header">
          <h2>{t('metrics.title', { productName: product.name })}</h2>
        </div>

        <div className="metrics-overview-grid">
          <div className="metric-card">
            <h4>{t('metrics.total_views')}</h4>
            <p className="metric-value">{product.views.toLocaleString()}</p>
          </div>
          <div className="metric-card">
            <h4>{t('metrics.total_clicks')}</h4>
            <p className="metric-value">{product.clicks.toLocaleString()}</p>
          </div>
          <div className="metric-card">
            <h4>{t('metrics.ctr')}</h4>
            <p className="metric-value">{ctr}%</p>
          </div>
          <div className="metric-card">
            <h4>{t('metrics.total_sales')}</h4>
            <p className="metric-value">{product.sales}</p>
          </div>
          <div className="metric-card">
            <h4>{t('metrics.conversion_rate')}</h4>
            <p className="metric-value">{conversionRate}%</p>
          </div>
          <div className="metric-card">
            <h4>{t('metrics.total_revenue')}</h4>
            <p className="metric-value">${product.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
        </div>

        <div className="sales-funnel-card">
          <h3>{t('metrics.sales_funnel_title')}</h3>
          <div className="funnel-step">
            <div className="funnel-label">{t('metrics.funnel_views')}</div>
            <div className="funnel-bar-container">
              <div className="funnel-bar" style={{ width: '100%' }}>{product.views.toLocaleString()}</div>
            </div>
          </div>
          <div className="funnel-step">
            <div className="funnel-label">{t('metrics.funnel_clicks')}</div>
            <div className="funnel-bar-container">
              <div className="funnel-bar" style={{ width: `${(product.clicks / product.views) * 100}%` }}>{product.clicks.toLocaleString()}</div>
            </div>
          </div>
          <div className="funnel-step">
            <div className="funnel-label">{t('metrics.funnel_added_to_cart')}</div>
            <div className="funnel-bar-container">
              <div className="funnel-bar" style={{ width: `${(product.cartAdds / product.views) * 100}%` }}>{product.cartAdds.toLocaleString()}</div>
            </div>
          </div>
          <div className="funnel-step">
            <div className="funnel-label">{t('metrics.funnel_purchased')}</div>
            <div className="funnel-bar-container">
              <div className="funnel-bar" style={{ width: `${(product.sales / product.views) * 100}%` }}>{product.sales.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="orders-card">
            <h3>{t('metrics.recent_orders_title')}</h3>
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>{t('metrics.order_id')}</th>
                            <th>{t('metrics.customer')}</th>
                            <th>{t('metrics.date')}</th>
                            <th>{t('metrics.shipping_address')}</th>
                            <th>{t('metrics.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.customer}</td>
                                <td>{order.date}</td>
                                <td>{order.shippingAddress}</td>
                                <td>
                                    <span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductMetricsPage;