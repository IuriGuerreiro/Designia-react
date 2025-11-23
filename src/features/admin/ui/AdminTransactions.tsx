import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminTransactions } from '@/features/admin/hooks';
import styles from './AdminTransactions.module.css';
import SelectRS from '@/shared/ui/SelectRS';
import Navbar from '@/app/layout/Navbar';

const DEFAULT_PAGE_SIZE = 50;

const AdminTransactions = () => {
  const { t } = useTranslation();
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
    return <div className={styles.loading}>{t('admin.transactions.loading')}</div>;
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t('admin.transactions.title')}</h1>
        <p>{t('admin.transactions.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <h3>{t('admin.transactions.summary.total_gross')}</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_gross, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>{t('admin.transactions.summary.total_net')}</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_net, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>{t('admin.transactions.summary.platform_fees')}</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_platform_fees, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>{t('admin.transactions.summary.stripe_fees')}</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_stripe_fees, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>{t('admin.transactions.summary.average_transaction')}</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.average_transaction, 'USD')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>{t('admin.transactions.summary.total_transactions')}</h3>
            <p className={styles.summaryValue}>{totalCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.filterForm}>
          <input
            type="text"
            placeholder={t('admin.transactions.filters.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />

                <SelectRS
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Filter by status"
                  fullWidth
                  isClearable
                />

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={styles.dateInput}
            placeholder={t('admin.transactions.filters.date_from')}
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={styles.dateInput}
            placeholder={t('admin.transactions.filters.date_to')}
          />

          <button type="submit" className={styles.searchButton}>
            {t('admin.transactions.actions.search')}
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
            {t('admin.transactions.actions.clear')}
          </button>
        </form>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Transactions Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('admin.transactions.table.transaction_id')}</th>
              <th>{t('admin.transactions.table.seller')}</th>
              <th>{t('admin.transactions.table.buyer')}</th>
              <th>{t('admin.transactions.table.gross_amount')}</th>
              <th>{t('admin.transactions.table.net_amount')}</th>
              <th>{t('admin.transactions.table.status')}</th>
              <th>{t('admin.transactions.table.hold_days')}</th>
              <th>{t('admin.transactions.table.paid_out')}</th>
              <th>{t('admin.transactions.table.created')}</th>
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
                    <span className={styles.na}>{t('admin.common.na')}</span>
                  )}
                </td>
                <td className={styles.amount}>
                  {formatCurrency(transaction.amounts.gross_amount, transaction.amounts.currency)}
                </td>
                <td className={styles.amountNet}>
                  {formatCurrency(transaction.amounts.net_amount, transaction.amounts.currency)}
                  <div className={styles.fees}>
                    <span>{t('admin.transactions.table.platform_fee')}: {formatCurrency(transaction.amounts.platform_fee, transaction.amounts.currency)}</span>
                    <span>{t('admin.transactions.table.stripe_fee')}: {formatCurrency(transaction.amounts.stripe_fee, transaction.amounts.currency)}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className={styles.holdDays}>
                  {transaction.hold_info.days_to_hold} {t('admin.common.days')}
                  {transaction.hold_info.hold_reason && (
                    <div className={styles.holdReason}>{transaction.hold_info.hold_reason}</div>
                  )}
                </td>
                <td>
                  <span className={transaction.payout_info.payed_out ? styles.paidOutYes : styles.paidOutNo}>
                    {transaction.payout_info.payed_out ? t('admin.common.yes') : t('admin.common.no')}
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
          {t('admin.common.previous')}
        </button>
        <span className={styles.paginationInfo}>
          {t('admin.common.page_info', { page: currentPage + 1, pages: Math.ceil(totalCount / pageSize), total: totalCount })}
        </span>
        <button
          onClick={handleNextPage}
          disabled={(currentPage + 1) * pageSize >= totalCount}
          className={styles.paginationButton}
        >
          {t('admin.common.next')}
        </button>
      </div>
    </div>
    </>
  );
};

export default AdminTransactions;
