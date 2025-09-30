import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import styles from './AdminTransactions.module.css';

interface UserInfo {
  id: string;
  username: string;
  email: string;
}

interface Transaction {
  id: string;
  order_id: string | null;
  stripe_payment_intent_id: string;
  status: string;
  seller: UserInfo;
  buyer: UserInfo | null;
  amounts: {
    gross_amount: string;
    platform_fee: string;
    stripe_fee: string;
    net_amount: string;
    currency: string;
  };
  hold_info: {
    status: string;
    hold_reason: string;
    days_to_hold: number;
    hold_start_date: string | null;
    planned_release_date: string | null;
    actual_release_date: string | null;
  };
  payout_info: {
    payed_out: boolean;
  };
  timestamps: {
    created_at: string;
    updated_at: string;
    purchase_date: string | null;
  };
}

interface TransactionSummary {
  total_gross: string;
  total_net: string;
  total_platform_fees: string;
  total_stripe_fees: string;
  average_transaction: string;
  status_breakdown: Record<string, number>;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total_count: number;
    offset: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: TransactionSummary;
}

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(50);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, searchQuery, fromDate, toDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getAllTransactions({
        offset: currentPage * pageSize,
        page_size: pageSize,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });

      setTransactions(response.transactions);
      setSummary(response.summary);
      setTotalCount(response.pagination.total_count);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(numAmount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'held':
        return styles.statusHeld;
      case 'released':
        return styles.statusReleased;
      case 'failed':
        return styles.statusFailed;
      case 'refunded':
        return styles.statusRefunded;
      default:
        return styles.statusDefault;
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * pageSize < totalCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchTransactions();
  };

  if (loading && transactions.length === 0) {
    return <div className={styles.loading}>Loading transactions...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin: All Transactions</h1>
        <p>Monitor all payment transactions across the platform</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <h3>Total Gross</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_gross, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Total Net</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_net, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Platform Fees</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_platform_fees, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Stripe Fees</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_stripe_fees, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Average Transaction</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.average_transaction, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Total Transactions</h3>
            <p className={styles.summaryValue}>{totalCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.filterForm}>
          <input
            type="text"
            placeholder="Search by seller, buyer, or order ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="held">Held</option>
            <option value="completed">Completed</option>
            <option value="released">Released</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={styles.dateInput}
            placeholder="From date"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={styles.dateInput}
            placeholder="To date"
          />

          <button type="submit" className={styles.searchButton}>
            Search
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('');
              setFromDate('');
              setToDate('');
              setCurrentPage(0);
            }}
            className={styles.clearButton}
          >
            Clear
          </button>
        </form>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Transactions Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Seller</th>
              <th>Buyer</th>
              <th>Gross Amount</th>
              <th>Net Amount</th>
              <th>Status</th>
              <th>Hold Days</th>
              <th>Paid Out</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className={styles.transactionId}>{transaction.id.substring(0, 8)}...</td>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.username}>@{transaction.seller.username}</div>
                    <div className={styles.email}>{transaction.seller.email}</div>
                  </div>
                </td>
                <td>
                  {transaction.buyer ? (
                    <div className={styles.userInfo}>
                      <div className={styles.username}>@{transaction.buyer.username}</div>
                      <div className={styles.email}>{transaction.buyer.email}</div>
                    </div>
                  ) : (
                    <span className={styles.na}>N/A</span>
                  )}
                </td>
                <td className={styles.amount}>
                  {formatCurrency(transaction.amounts.gross_amount, transaction.amounts.currency)}
                </td>
                <td className={styles.amountNet}>
                  {formatCurrency(transaction.amounts.net_amount, transaction.amounts.currency)}
                  <div className={styles.fees}>
                    <span>Platform: {formatCurrency(transaction.amounts.platform_fee, transaction.amounts.currency)}</span>
                    <span>Stripe: {formatCurrency(transaction.amounts.stripe_fee, transaction.amounts.currency)}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className={styles.holdDays}>
                  {transaction.hold_info.days_to_hold} days
                  {transaction.hold_info.hold_reason && (
                    <div className={styles.holdReason}>{transaction.hold_info.hold_reason}</div>
                  )}
                </td>
                <td>
                  <span className={transaction.payout_info.payed_out ? styles.paidOutYes : styles.paidOutNo}>
                    {transaction.payout_info.payed_out ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className={styles.date}>{formatDate(transaction.timestamps.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className={styles.paginationButton}
        >
          Previous
        </button>
        <span className={styles.paginationInfo}>
          Page {currentPage + 1} of {Math.ceil(totalCount / pageSize)} ({totalCount} total)
        </span>
        <button
          onClick={handleNextPage}
          disabled={(currentPage + 1) * pageSize >= totalCount}
          className={styles.paginationButton}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminTransactions;