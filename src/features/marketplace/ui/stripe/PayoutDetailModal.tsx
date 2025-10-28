import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  paymentService,
  type PayoutOrder,
  type PayoutOrdersResponse,
  type PayoutSummary,
} from '@/features/payments/api';
import './PayoutDetailModal.css';

interface PayoutDetailModalProps {
  payout: PayoutSummary;
  isOpen: boolean;
  onClose: () => void;
}

const PayoutDetailModal: React.FC<PayoutDetailModalProps> = ({ payout, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<PayoutOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadPayoutOrders();
    }
  }, [isOpen, payout.id]);

  const loadPayoutOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentService.getPayoutOrders(payout.id);
      setOrders(response.orders);
      
    } catch (err: any) {
      console.error('Error loading payout orders:', err);
      setError(err.message || t('stripe.payouts.errors.load_orders_failed'));
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: string, currency: string = payout.currency) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return `${symbols[currency] || currency} ${amount}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'delivered':
        return 'success';
      case 'pending':
      case 'processing':
      case 'shipped':
        return 'warning';
      case 'failed':
      case 'canceled':
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payout-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('stripe.payouts.details_title')}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* Payout Summary */}
          <div className="payout-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <label>{t('stripe.payouts.payout_id')}</label>
                <code>{payout.stripe_payout_id}</code>
              </div>
              <div className="summary-item">
                <label>{t('orders.total')}</label>
                <strong className="payout-amount">{payout.formatted_amount}</strong>
              </div>
              <div className="summary-item">
                <label>{t('metrics.status')}</label>
                <span className={`status-badge status-${getStatusColor(payout.status)}`}>
                  {payout.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="summary-item">
                <label>{t('stripe.payouts.type')}</label>
                <span className="payout-type">
                  {payout.payout_type.charAt(0).toUpperCase() + payout.payout_type.slice(1)}
                </span>
              </div>
              <div className="summary-item">
                <label>Orders Included</label>
                <span className="orders-count">{payout.transfer_count}</span>
              </div>
              <div className="summary-item">
                <label>Created</label>
                <span>{formatDate(payout.created_at)}</span>
              </div>
              {payout.arrival_date && (
                <div className="summary-item">
                  <label>{t('stripe.payouts.expected_arrival')}</label>
                  <span>{formatDate(payout.arrival_date)}</span>
                </div>
              )}
              {payout.bank_name && (
                <div className="summary-item">
                  <label>{t('stripe.payouts.bank_account')}</label>
                  <div>
                    <div>{payout.bank_name}</div>
                    {payout.bank_account_last4 && (
                      <small>****{payout.bank_account_last4}</small>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className="orders-section">
            <h3>{t('stripe.payouts.orders_included')}</h3>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t('stripe.payouts.loading_orders') || 'Loading order details...'}</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p>{t('orders.errors.unable_to_load') || 'Error loading orders'}: {error}</p>
                <button onClick={loadPayoutOrders} className="retry-button">
                  {t('orders.actions.try_again')}
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="no-orders">
                <p>{t('stripe.payouts.no_order_details') || 'No order details available for this payout.'}</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.order_id} className="order-card">
                    <div 
                      className="order-header"
                      onClick={() => toggleOrderExpansion(order.order_id)}
                    >
                      <div className="order-info">
                        <div className="order-id">
                          <strong>{t('orders.order_id')} #{order.order_id.slice(-8)}</strong>
                          <span className="order-date">{formatDate(order.order_date)}</span>
                        </div>
                        <div className="order-customer">
                          <span>{t('metrics.customer') || 'Customer'}: {order.buyer_username}</span>
                        </div>
                      </div>
                      <div className="order-amounts">
                        <div className="order-total">
                          <span className="label">Order Total:</span>
                          <strong>{formatCurrency(order.total_amount)}</strong>
                        </div>
                        <div className="transfer-amount">
                          <span className="label">Transfer Amount:</span>
                          <strong className="transfer-highlight">
                            {formatCurrency(order.transfer_amount)}
                          </strong>
                        </div>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge status-${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                        <button className="expand-button">
                          {expandedOrders.has(order.order_id) ? '▼' : '▶'}
                        </button>
                      </div>
                    </div>

                    {expandedOrders.has(order.order_id) && (
                      <div className="order-details">
                        {/* Order breakdown */}
                        {order.subtotal && (
                        <div className="order-breakdown">
                          <h4>{t('stripe.payouts.order_breakdown')}</h4>
                          <div className="breakdown-grid">
                            <div className="breakdown-item">
                              <span>{t('checkout.subtotal_label')}:</span>
                              <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.shipping_cost && order.shipping_cost !== '0.00' && (
                              <div className="breakdown-item">
                                <span>{t('checkout.shipping_label')}:</span>
                                <span>{formatCurrency(order.shipping_cost)}</span>
                              </div>
                            )}
                            {order.tax_amount && order.tax_amount !== '0.00' && (
                              <div className="breakdown-item">
                                  <span>{t('checkout.tax_label')}:</span>
                                  <span>{formatCurrency(order.tax_amount)}</span>
                                </div>
                              )}
                              <div className="breakdown-item total">
                                <span><strong>{t('checkout.total_label')}:</strong></span>
                                <span><strong>{formatCurrency(order.total_amount)}</strong></span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Items list */}
                        {order.items && order.items.length > 0 ? (
                          <div className="order-items">
                            <h4>{t('orders.detail.items')}</h4>
                            <div className="items-list">
                              {order.items.map((item, index) => (
                                <div key={index} className="item-row">
                                  <div className="item-info">
                                    <span className="item-name">{item.product_name}</span>
                                    <span className="item-quantity">{t('orders.detail.quantity_label')}: {item.quantity}</span>
                                  </div>
                                  <div className="item-pricing">
                                    <span className="item-price">{formatCurrency(item.price)} {t('stripe.payouts.each')}</span>
                                    <span className="item-total">{formatCurrency(item.total)} {t('stripe.payouts.total')}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : order.item_names ? (
                          <div className="order-items">
                            <h4>{t('orders.detail.items')}</h4>
                            <p className="item-names">{order.item_names}</p>
                          </div>
                        ) : null}

                        {/* Transfer details */}
                        <div className="transfer-details">
                          <h4>{t('stripe.payouts.transfer_details')}</h4>
                          <div className="transfer-grid">
                            <div className="transfer-item">
                              <span>{t('stripe.payouts.transfer_date')}:</span>
                              <span>{formatDate(order.transfer_date)}</span>
                            </div>
                            <div className="transfer-item">
                              <span>{t('stripe.payouts.payment_status')}:</span>
                              <span className={`status-badge status-${getStatusColor(order.payment_status)}`}>
                                {order.payment_status.toUpperCase()}
                              </span>
                            </div>
                            <div className="transfer-item highlight">
                              <span><strong>{t('stripe.payouts.amount_transferred')}:</strong></span>
                              <span><strong>{formatCurrency(order.transfer_amount)}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-modal-button">
            {t('orders.actions.close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutDetailModal;
