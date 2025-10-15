import { useEffect, useState } from 'react';
import { useAdminTransactions } from '@/features/admin/hooks';
import styles from './AdminTransactions.module.css';

const DEFAULT_PAGE_SIZE = 50;

const AdminTransactions = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const {
    transactions,
    summary,
    pagination,
    loading,
    error,
    fetchTransactions,
  } = useAdminTransactions(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    fetchTransactions(currentPage, {
      status: statusFilter || undefined,
      search: searchQuery || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  }, [currentPage, statusFilter, searchQuery, fromDate, toDate, fetchTransactions]);

  const totalCount = pagination?.total_count ?? 0;
  const pageSize = pagination?.page_size ?? DEFAULT_PAGE_SIZE;

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
    fetchTransactions(0, {
      status: statusFilter || undefined,
      search: searchQuery || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
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