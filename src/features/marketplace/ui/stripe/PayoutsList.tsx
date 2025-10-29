import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentService, type PayoutSummary } from '@/features/payments/api';
import PayoutDetailModal from './PayoutDetailModal';
import styles from './PayoutsList.module.css';

interface PayoutsListProps {
  className?: string;
}

interface PaginationState {
  offset: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const PayoutsList: React.FC<PayoutsListProps> = ({ className }) => {
  const { t } = useTranslation();
  const [payouts, setPayouts] = useState<PayoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutSummary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    offset: 0,
    pageSize: 20,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  });

  useEffect(() => {
    loadPayouts();
  }, [pagination.offset]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentService.getUserPayouts(
        pagination.offset,
        pagination.pageSize
      );
      
      setPayouts(response.payouts);
      setPagination(prev => ({
        ...prev,
        totalCount: response.pagination.total_count,
        hasNext: response.pagination.has_next,
        hasPrevious: response.pagination.has_previous,
      }));
      
    } catch (err: any) {
      console.error('Error loading payouts:', err);
      setError(err.message || t('stripe.payouts.errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutClick = (payout: PayoutSummary) => {
    setSelectedPayout(payout);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPayout(null);
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.pageSize,
      }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevious) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.pageSize),
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
      case 'in_transit':
        return 'warning';
      case 'failed':
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && payouts.length === 0) {
    return (
      <div className={`${styles['payouts-list']} ${className || ''}`}>
        <div className={styles['payouts-header']}>
          <h2>{t('stripe.payouts.title')}</h2>
          <p className={styles['payouts-subtitle']}>{t('stripe.payouts.subtitle')}</p>
        </div>
        <div className={styles['payouts-loading']}>
          <div className={styles['loading-spinner']}></div>
          <p>{t('stripe.payouts.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && payouts.length === 0) {
    return (
      <div className={`${styles['payouts-list']} ${className || ''}`}>
        <div className={styles['payouts-header']}>
          <h2>{t('stripe.payouts.title')}</h2>
          <p className={styles['payouts-subtitle']}>{t('stripe.payouts.subtitle')}</p>
        </div>
        <div className={styles['payouts-error']}>
          <p>{t('common.error') || 'Error'}: {error}</p>
          <button onClick={loadPayouts} className={styles['retry-button']}>
            {t('orders.actions.try_again')}
          </button>
        </div>
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className={`${styles['payouts-list']} ${className || ''}`}>
        <div className={styles['payouts-header']}>
          <h2>{t('stripe.payouts.title')}</h2>
          <p className={styles['payouts-subtitle']}>{t('stripe.payouts.subtitle')}</p>
        </div>
        <div className={styles['payouts-empty']}>
          <div className={styles['empty-state']}>
            <div className={styles['empty-icon']}>💰</div>
            <h3>{t('stripe.payouts.empty_title') || 'No Payouts Yet'}</h3>
            <p>{t('stripe.payouts.empty_message_1') || "You haven't received any payouts from your sales yet."}</p>
            <p>{t('stripe.payouts.empty_message_2') || 'Once you start selling, your payouts will appear here.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['payouts-list']} ${className || ''}`}>
              <div className={styles['payouts-header']}>
          <div className={styles['payouts-header-content']}>
            <h2>{t('stripe.payouts.title')}</h2>
            <p className={styles['payouts-subtitle']}>{t('stripe.payouts.subtitle')}</p>
          </div>
          <div className={styles['payouts-stats']}>
            <span className={styles['total-count']}>{t('stripe.payouts.total_count', { count: pagination.totalCount })}</span>
          </div>
        </div>

      <div className={styles['payouts-table-container']}>
        <table className={styles['payouts-table']}>
          <thead>
            <tr>
              <th>{t('metrics.date')}</th>
              <th>{t('stripe.payouts.payout_id')}</th>
              <th>{t('orders.total')}</th>
              <th>{t('metrics.status')}</th>
              <th>{t('orders.title')}</th>
              <th>{t('stripe.payouts.bank_account')}</th>
              <th>{t('stripe.payouts.arrival_date')}</th>
              <th>{t('stripe.payouts.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr 
                key={payout.id} 
                className={styles['payout-row']}
                onClick={() => handlePayoutClick(payout)}
              >
                <td className={styles['payout-date']}>
                  {formatDate(payout.created_at)}
                  <small>{t('stripe.payouts.days_ago', { count: payout.days_since_created })}</small>
                </td>
                <td className={styles['payout-id']}>
                  <code>{payout.stripe_payout_id.slice(-8)}</code>
                </td>
                <td className={styles['payout-amount']}>
                  <strong>{payout.formatted_amount}</strong>
                  <small>{payout.payout_type}</small>
                </td>
                <td className={styles['payout-status']}>
                  <span className={`${styles['status-badge']} ${styles[`status-${getStatusColor(payout.status)}`]}`}>
                    {payout.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className={styles['payout-orders']}>
                  <span className={styles['orders-count']}>{payout.transfer_count}</span>
                  <small>{t('orders.title')}</small>
                </td>
                <td className={styles['payout-bank']}>
                  {payout.bank_name ? (
                    <div>
                      <div className="bank-name">{payout.bank_name}</div>
                      {payout.bank_account_last4 && (
                        <small>****{payout.bank_account_last4}</small>
                      )}
                    </div>
                  ) : (
                    <span className="no-bank">{t('seller_page.na_label')}</span>
                  )}
                </td>
                <td className={styles['payout-arrival']}>
                  {payout.arrival_date ? formatDate(payout.arrival_date) : t('seller_page.na_label')}
                </td>
                <td className={styles['payout-actions']}>
                  <button 
                    className={styles['view-details-btn']}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePayoutClick(payout);
                    }}
                  >
                    {t('orders.view_details')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(pagination.hasNext || pagination.hasPrevious) && (
        <div className={styles['payouts-pagination']}>
          <button
            onClick={handlePrevPage}
            disabled={!pagination.hasPrevious}
            className={styles['pagination-btn']}
          >
            ← {t('stripe.payouts.previous')}
          </button>
          
          <span className={styles['pagination-info']}>
            {t('stripe.payouts.showing_range', { start: pagination.offset + 1, end: Math.min(pagination.offset + pagination.pageSize, pagination.totalCount), total: pagination.totalCount })}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={!pagination.hasNext}
            className={styles['pagination-btn']}
          >
            {t('stripe.payouts.next')} →
          </button>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && (
        <div className={styles['payouts-loading-overlay']}>
          <div className={styles['loading-spinner']}></div>
        </div>
      )}

      {/* Modal for payout details */}
      {showModal && selectedPayout && (
        <PayoutDetailModal
          payout={selectedPayout}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PayoutsList;
