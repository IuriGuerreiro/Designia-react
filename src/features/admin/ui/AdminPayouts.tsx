import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminPayouts } from '@/features/admin/hooks';
import styles from './AdminPayouts.module.css';
import SelectRS from '@/shared/ui/SelectRS';
import Navbar from '@/app/layout/Navbar';

const DEFAULT_PAGE_SIZE = 50;

const AdminPayouts = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const {
    payouts,
    summary,
    pagination,
    loading,
    error,
    fetchPayouts,
  } = useAdminPayouts(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    fetchPayouts(currentPage, {
      status: statusFilter || undefined,
      search: searchQuery || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  }, [currentPage, statusFilter, searchQuery, fromDate, toDate, fetchPayouts]);

  const totalCount = pagination?.total_count ?? 0;
  const pageSize = pagination?.page_size ?? DEFAULT_PAGE_SIZE;

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
    fetchPayouts(0, {
      status: statusFilter || undefined,
      search: searchQuery || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  };

  if (loading && payouts.length === 0) {
    return <div className={styles.loading}>{t('admin.payouts.loading')}</div>;
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t('admin.payouts.title')}</h1>
        <p>{t('admin.payouts.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <h3>{t('admin.payouts.summary.total_amount')}</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_amount, 'EUR')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>{t('admin.payouts.summary.average_payout')}</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.average_amount, 'EUR')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>{t('admin.payouts.summary.total_fees')}</h3>
            <p className={styles.summaryValue}>{formatCurrency(summary.total_fees, 'EUR')}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>{t('admin.payouts.summary.total_payouts')}</h3>
            <p className={styles.summaryValue}>{totalCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <form onSubmit={handleSearch} className={styles.filterForm}>
          <input
            type="text"
            placeholder={t('admin.payouts.filters.search_placeholder')}
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
            placeholder={t('admin.payouts.filters.date_from')}
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={styles.dateInput}
            placeholder={t('admin.payouts.filters.date_to')}
          />

          <button type="submit" className={styles.searchButton}>
            {t('admin.payouts.actions.search')}
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
            {t('admin.payouts.actions.clear')}
          </button>
        </form>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Payouts Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('admin.payouts.table.payout_id')}</th>
              <th>{t('admin.payouts.table.seller')}</th>
              <th>{t('admin.payouts.table.amount')}</th>
              <th>{t('admin.payouts.table.status')}</th>
              <th>{t('admin.payouts.table.type')}</th>
              <th>{t('admin.payouts.table.created')}</th>
              <th>{t('admin.payouts.table.stripe_id')}</th>
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

export default AdminPayouts;
