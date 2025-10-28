import React, { useEffect, useState } from 'react';
import { Layout } from '@/app/layout';
import { paymentService, type HoldsSummary, type PaymentHoldsResponse, type PaymentTransaction } from '../features/payments/api';
import styles from './StripeHolds.module.css';

type ProgressBarProps = {
  percentage: number;
  holdStatus: PaymentTransaction['hold_status'];
};

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, holdStatus }) => (
  <div className={styles.progressBlock}>
    <div className={styles.progressHeader}>
      <span>Hold progress</span>
      {holdStatus.is_ready_for_release ? (
        <span className={styles.progressStatusReady}>Ready for release</span>
      ) : (
        <span className={styles.progressStatusPending}>{holdStatus.time_display}</span>
      )}
    </div>
    <div className={styles.progressTrack}>
      <div className={styles.progressFill} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} />
    </div>
    <div className={styles.progressTimeline}>
      <span>Started {formatDate(holdStatus.hold_start_date || '')}</span>
      <span>{percentage.toFixed(1)}% complete</span>
      <span>Releases {formatDate(holdStatus.planned_release_date || '')}</span>
    </div>
  </div>
);

const formatDate = (dateString: string) => {
  if (!dateString) {
    return 'TBC';
  }

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount: number | string, currency: string = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);

const StripeHolds: React.FC = () => {
  const [holds, setHolds] = useState<PaymentTransaction[]>([]);
  const [summary, setSummary] = useState<HoldsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPaymentHolds();
  }, []);

  const fetchPaymentHolds = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: PaymentHoldsResponse = await paymentService.getSellerPaymentHolds();

      if (data.success) {
        setHolds(data.holds);
        setSummary(data.summary);
      } else {
        setError(data.message || 'Failed to fetch payment holds');
      }
    } catch (err) {
      setError('Network error occurred while fetching payment holds');
      console.error('Error fetching payment holds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferPayment = async (transactionId: string) => {
    try {
      setTransferring(prev => new Set([...prev, transactionId]));

      const response = await paymentService.transferPaymentToSeller({
        transaction_id: transactionId
      });

      if (response.success) {
        alert(`✅ Payment transferred successfully!\n\nTransfer ID: ${response.transfer_details.transfer_id}\nAmount: $${response.transfer_details.amount_dollars} ${response.transfer_details.currency.toUpperCase()}`);
        await fetchPaymentHolds();
      } else {
        alert(`❌ Transfer failed: ${response.detail || response.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error transferring payment:', err);
      alert('❌ Network error occurred while transferring payment. Please try again.');
    } finally {
      setTransferring(prev => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  };

  const getStatusBadgeClass = (status: string, isReady: boolean = false) => {
    if (isReady) {
      return `${styles.holdStatusBadge} ${styles.holdStatusReady}`;
    }

    switch (status) {
      case 'held':
        return `${styles.holdStatusBadge} ${styles.holdStatusHeld}`;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return `${styles.holdStatusBadge} ${styles.holdStatusFailed}`;
      default:
        return `${styles.holdStatusBadge} ${styles.holdStatusDefault}`;
    }
  };

  if (loading) {
    return (
      <Layout maxWidth="wide">
        <section className={styles.page}>
          <div className={styles.emptyState}>
            <div className={styles.refreshSpinner} aria-hidden />
            <p>Loading payment holds…</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout maxWidth="wide">
        <section className={styles.page}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚠️</div>
            <h2 className={styles.title} style={{ fontSize: '1.8rem' }}>Error loading payment holds</h2>
            <p>{error}</p>
            <div className={styles.refresh}>
              <button type="button" className={styles.refreshButton} onClick={fetchPaymentHolds}>
                Try again
              </button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="wide">
      <section className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Payment holds</h1>
          <p className={styles.subtitle}>
            Track pending disbursements from your marketplace orders, monitor release timelines, and accelerate transfers once balances become available.
          </p>
        </header>

        {summary && (
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span className={styles.summaryIcon}>📦</span>
              <div className={styles.summaryMeta}>
                <span className={styles.summaryLabel}>Total holds</span>
                <span className={styles.summaryValue}>{summary.total_holds}</span>
              </div>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.summaryIcon}>💰</span>
              <div className={styles.summaryMeta}>
                <span className={styles.summaryLabel}>Pending amount</span>
                <span className={styles.summaryValue}>{formatCurrency(summary.total_pending_amount, summary.currency)}</span>
              </div>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.summaryIcon}>✅</span>
              <div className={styles.summaryMeta}>
                <span className={styles.summaryLabel}>Ready for release</span>
                <span className={styles.summaryValue}>{summary.ready_for_release_count}</span>
              </div>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.summaryIcon}>⏰</span>
              <div className={styles.summaryMeta}>
                <span className={styles.summaryLabel}>Still processing</span>
                <span className={styles.summaryValue}>{summary.total_holds - summary.ready_for_release_count}</span>
              </div>
            </article>
          </div>
        )}

        {holds.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h2 className={styles.title} style={{ fontSize: '1.8rem' }}>No payment holds</h2>
            <p>You currently have no disbursements awaiting release.</p>
          </div>
        ) : (
          <div className={styles.holdList}>
            {holds.map(transaction => (
              <article key={transaction.transaction_id} className={styles.holdCard}>
                <div className={styles.holdHeader}>
                  <div className={styles.holdHeadline}>
                    <h3>Order #{transaction.order_id.slice(-8)}</h3>
                    <p>Transaction: {transaction.transaction_id.slice(-8)}</p>
                    <p>Purchased {formatDate(transaction.order_details.purchase_date)}</p>
                  </div>
                  <div className={styles.holdActions}>
                    <span className={getStatusBadgeClass(transaction.hold_status.status, transaction.hold_status.is_ready_for_release)}>
                      {transaction.hold_status.is_ready_for_release ? 'Ready for release' : transaction.hold_status.status_display}
                    </span>
                    <div className={styles.holdAmount}>
                      <strong>{formatCurrency(transaction.amounts.net_amount, transaction.amounts.currency)}</strong>
                      <span>Net amount</span>
                    </div>
                    {transaction.hold_status.is_ready_for_release && (
                      <button
                        type="button"
                        className={styles.transferButton}
                        onClick={() => handleTransferPayment(transaction.transaction_id)}
                        disabled={transferring.has(transaction.transaction_id)}
                      >
                        {transferring.has(transaction.transaction_id) ? (
                          <>
                            <span className={styles.transferSpinner} aria-hidden />
                            Transferring…
                          </>
                        ) : (
                          <>
                            <span aria-hidden>💸</span>
                            Transfer payment
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <ProgressBar percentage={transaction.hold_status.progress_percentage} holdStatus={transaction.hold_status} />
                </div>

                <div className={styles.holdBody}>
                  <div className={styles.infoTiles}>
                    <div className={styles.infoTile}>
                      <span className={styles.tileTitle}>👤 Buyer information</span>
                      <div className={styles.tileRow}>
                        <span>Name</span>
                        <span>
                          {transaction.buyer.first_name && transaction.buyer.last_name
                            ? `${transaction.buyer.first_name} ${transaction.buyer.last_name}`
                            : transaction.buyer.username}
                        </span>
                      </div>
                      <div className={styles.tileRow}>
                        <span>Username</span>
                        <span>@{transaction.buyer.username}</span>
                      </div>
                      <div className={styles.tileRow}>
                        <span>Email</span>
                        <span>{transaction.buyer.email}</span>
                      </div>
                    </div>

                    <div className={styles.infoTile}>
                      <span className={styles.tileTitle}>💰 Payment breakdown</span>
                      <div className={styles.tileRow}>
                        <span>Gross amount</span>
                        <span>{formatCurrency(transaction.amounts.gross_amount, transaction.amounts.currency)}</span>
                      </div>
                      <div className={styles.tileRow}>
                        <span>Platform fee</span>
                        <span className={styles.tileHighlight}>-{formatCurrency(transaction.amounts.platform_fee, transaction.amounts.currency)}</span>
                      </div>
                      <div className={styles.tileRow}>
                        <span>Stripe fee</span>
                        <span className={styles.tileHighlight}>-{formatCurrency(transaction.amounts.stripe_fee, transaction.amounts.currency)}</span>
                      </div>
                      <div className={styles.tileRow}>
                        <span>You&apos;ll receive</span>
                        <span className={styles.tileHighlight}>{formatCurrency(transaction.amounts.net_amount, transaction.amounts.currency)}</span>
                      </div>
                    </div>

                    <div className={styles.infoTile}>
                      <span className={styles.tileTitle}>🔒 Hold details</span>
                      <div className={styles.tileRow}>
                        <span>Reason</span>
                        <span>{transaction.hold_status.reason_display}</span>
                      </div>
                      <div className={styles.tileRow}>
                        <span>Duration</span>
                        <span>{transaction.hold_status.total_hold_days} days</span>
                      </div>
                      <div className={styles.tileRow}>
                        <span>Remaining</span>
                        <span className={styles.progressStatusPending}>{transaction.hold_status.time_display}</span>
                      </div>
                    </div>
                  </div>

                  {transaction.order_details.items.length > 0 && (
                    <div className={styles.itemsSection}>
                      <span className={styles.tileTitle}>📦 Items ({transaction.order_details.item_count})</span>
                      <div className={styles.itemsGrid}>
                        {transaction.order_details.items.map((item, index) => (
                          <div key={`${transaction.transaction_id}-${index}`} className={styles.itemCard}>
                            <strong>{item.product_name}</strong>
                            <span>Quantity: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {transaction.hold_status.hold_notes && (
                    <div className={styles.notesSection}>
                      <span className={styles.tileTitle}>📝 Notes</span>
                      <div className={styles.notesBody}>{transaction.hold_status.hold_notes}</div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={styles.refresh}>
          <button type="button" className={styles.refreshButton} onClick={fetchPaymentHolds} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.refreshSpinner} aria-hidden />
                Refreshing…
              </>
            ) : (
              <>
                <span aria-hidden>🔄</span>
                Refresh holds
              </>
            )}
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default StripeHolds;
