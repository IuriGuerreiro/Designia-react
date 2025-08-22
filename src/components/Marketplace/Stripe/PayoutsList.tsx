import React, { useState, useEffect } from 'react';
import { paymentService, type PayoutSummary, type PayoutOrdersResponse } from '../../../services/paymentService';
import PayoutDetailModal from './PayoutDetailModal';
import './PayoutsList.css';

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
      setError(err.message || 'Failed to load payouts');
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
      <div className={`payouts-list ${className || ''}`}>
        <div className="payouts-header">
          <h2>Your Payouts</h2>
        </div>
        <div className="payouts-loading">
          <div className="loading-spinner"></div>
          <p>Loading your payouts...</p>
        </div>
      </div>
    );
  }

  if (error && payouts.length === 0) {
    return (
      <div className={`payouts-list ${className || ''}`}>
        <div className="payouts-header">
          <h2>Your Payouts</h2>
        </div>
        <div className="payouts-error">
          <p>Error: {error}</p>
          <button onClick={loadPayouts} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className={`payouts-list ${className || ''}`}>
        <div className="payouts-header">
          <h2>Your Payouts</h2>
        </div>
        <div className="payouts-empty">
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No Payouts Yet</h3>
            <p>You haven't received any payouts from your sales yet.</p>
            <p>Once you start selling, your payouts will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`payouts-list ${className || ''}`}>
      <div className="payouts-header">
        <h2>Your Payouts</h2>
        <div className="payouts-stats">
          <span className="total-count">{pagination.totalCount} total payouts</span>
        </div>
      </div>

      <div className="payouts-table-container">
        <table className="payouts-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Payout ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Orders</th>
              <th>Bank Account</th>
              <th>Arrival Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr 
                key={payout.id} 
                className="payout-row"
                onClick={() => handlePayoutClick(payout)}
              >
                <td className="payout-date">
                  {formatDate(payout.created_at)}
                  <small>{payout.days_since_created} days ago</small>
                </td>
                <td className="payout-id">
                  <code>{payout.stripe_payout_id.slice(-8)}</code>
                </td>
                <td className="payout-amount">
                  <strong>{payout.formatted_amount}</strong>
                  <small>{payout.payout_type}</small>
                </td>
                <td className="payout-status">
                  <span className={`status-badge status-${getStatusColor(payout.status)}`}>
                    {payout.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="payout-orders">
                  <span className="orders-count">{payout.transfer_count}</span>
                  <small>orders</small>
                </td>
                <td className="payout-bank">
                  {payout.bank_name ? (
                    <div>
                      <div className="bank-name">{payout.bank_name}</div>
                      {payout.bank_account_last4 && (
                        <small>****{payout.bank_account_last4}</small>
                      )}
                    </div>
                  ) : (
                    <span className="no-bank">N/A</span>
                  )}
                </td>
                <td className="payout-arrival">
                  {payout.arrival_date ? formatDate(payout.arrival_date) : 'N/A'}
                </td>
                <td className="payout-actions">
                  <button 
                    className="view-details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePayoutClick(payout);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(pagination.hasNext || pagination.hasPrevious) && (
        <div className="payouts-pagination">
          <button
            onClick={handlePrevPage}
            disabled={!pagination.hasPrevious}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.pageSize, pagination.totalCount)} of {pagination.totalCount}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && (
        <div className="payouts-loading-overlay">
          <div className="loading-spinner"></div>
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