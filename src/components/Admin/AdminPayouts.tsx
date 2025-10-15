import React, { useState, useEffect } from 'react';
import adminService from '../../features/admin/api/adminService';
import styles from './AdminPayouts.module.css';

interface SellerInfo {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Payout {
  id: string;
  stripe_payout_id: string;
  status: string;
  payout_type: string;
  amount: string;
  currency: string;
  created_at: string;
  seller_info: SellerInfo;
}

interface PayoutSummary {
  total_amount: string;
  average_amount: string;
  total_fees: string;
  status_breakdown: Record<string, number>;
}

interface PayoutsResponse {
  payouts: Payout[];
  pagination: {
    total_count: number;
    offset: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: PayoutSummary;
}

const AdminPayouts: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
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
    fetchPayouts();
  }, [currentPage, statusFilter, searchQuery, fromDate, toDate]);

  const fetchPayouts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getAllPayouts({
        offset: currentPage * pageSize,
        page_size: pageSize,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });

      setPayouts(response.payouts);
      setSummary(response.summary);
      setTotalCount(response.pagination.total_count);
    } catch (err: any) {
      console.error('Error fetching payouts:', err);
      setError(err.message || 'Failed to load payouts');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return styles.statusPaid;
      case 'pending':
        return styles.statusPending;
      case 'failed':
        return styles.statusFailed;
      case 'in_transit':
        return styles.statusTransit;
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
    fetchPayouts();
  };

  if (loading && payouts.length === 0) {
    return <div className={styles.loading}>Loading payouts...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin: All Payouts</h1>
        <p>Oversee all seller payouts across the platform</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <h3>Total Amount</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_amount, 'EUR')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Average Payout</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.average_amount, 'EUR')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Total Fees</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_fees, 'EUR')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Total Payouts</h3>
            <p className={styles.summaryValue}>{totalCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.filterForm}>
          <input
            type="text"
            placeholder="Search by seller username or email"
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
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="in_transit">In Transit</option>
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

      {/* Payouts Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Payout ID</th>
              <th>Seller</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Type</th>
              <th>Created</th>
              <th>Stripe ID</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id}>
                <td className={styles.payoutId}>{payout.id.substring(0, 8)}...</td>
                <td>
                  <div className={styles.sellerInfo}>
                    <div className={styles.sellerName}>
                      {payout.seller_info.first_name} {payout.seller_info.last_name}
                    </div>
                    <div className={styles.sellerUsername}>@{payout.seller_info.username}</div>
                    <div className={styles.sellerEmail}>{payout.seller_info.email}</div>
                  </div>
                </td>
                <td className={styles.amount}>
                  {formatCurrency(payout.amount, payout.currency)}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(payout.status)}`}>
                    {payout.status}
                  </span>
                </td>
                <td className={styles.type}>{payout.payout_type}</td>
                <td className={styles.date}>{formatDate(payout.created_at)}</td>
                <td className={styles.stripeId}>{payout.stripe_payout_id.substring(0, 12)}...</td>
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

export default AdminPayouts;