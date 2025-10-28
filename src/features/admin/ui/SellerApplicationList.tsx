import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useSellerApplications } from '@/features/admin/hooks';
import type { SellerApplicationStatus } from '@/features/admin/model';
import styles from './SellerApplicationList.module.css';

const SellerApplicationList = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const [filter, setFilter] = useState<SellerApplicationStatus | 'all'>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const {
    applications,
    loading,
    error,
    fetchApplications,
    updateStatus,
    filterByStatus,
  } = useSellerApplications();

  useEffect(() => {
    if (user && !isAdmin()) {
      window.location.href = '/';
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && isAdmin()) {
      fetchApplications().catch(() => null);
    }
  }, [user, isAdmin, fetchApplications]);

  const filteredApplications = useMemo(
    () => filterByStatus(filter),
    [filter, filterByStatus],
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusBadge = (status: SellerApplicationStatus) => {
    const baseClass = styles.statusBadge;
    switch (status) {
      case 'pending':
        return `${baseClass} ${styles.statusPending}`;
      case 'under_review':
        return `${baseClass} ${styles.statusReview}`;
      case 'approved':
        return `${baseClass} ${styles.statusApproved}`;
      case 'rejected':
        return `${baseClass} ${styles.statusRejected}`;
      case 'revision_requested':
        return `${baseClass} ${styles.statusRevision}`;
      default:
        return baseClass;
    }
  };

  const handleApprove = async (applicationId: number) => {
    if (!window.confirm(t('admin.seller_applications.confirm.approve'))) return;

    try {
      setProcessingId(applicationId);
      await updateStatus(applicationId, 'approve');
      alert(t('admin.seller_applications.alerts.approve_success'));
    } catch (err: any) {
      alert(err?.message || t('admin.seller_applications.alerts.approve_failed'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: number) => {
    const reason = prompt(t('admin.seller_applications.confirm.reject_reason'));
    if (reason === null) return;

    try {
      setProcessingId(applicationId);
      await updateStatus(applicationId, 'reject', { reason: reason || undefined });
      alert(t('admin.seller_applications.alerts.reject_success'));
    } catch (err: any) {
      alert(err?.message || t('admin.seller_applications.alerts.reject_failed'));
    } finally {
      setProcessingId(null);
    }
  };

  if (!user || !isAdmin()) {
    return (
      <div className={styles.adminAccessDenied}>
        <h2>{t('admin.seller_applications.access_denied_title')}</h2>
        <p>{t('admin.seller_applications.access_denied_message')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.adminLoading}>
        <div className={styles.loadingSpinner}></div>
        <p>{t('admin.seller_applications.loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.sellerApplicationsAdmin}>
      <div className={styles.adminHeader}>
        <h1>{t('admin.seller_applications.title')}</h1>
        <div className={styles.adminStats}>
          <span className={styles.stat}>
            {t('admin.seller_applications.stats.total', { count: applications.length })}
          </span>
          <span className={`${styles.stat} ${styles.statPending}`}>
            {t('admin.seller_applications.stats.pending', { count: applications.filter(app => app.status === 'pending').length })}
          </span>
          <span className={`${styles.stat} ${styles.statApproved}`}>
            {t('admin.seller_applications.stats.approved', { count: applications.filter(app => app.status === 'approved').length })}
          </span>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => fetchApplications()}>{t('admin.seller_applications.error_retry')}</button>
        </div>
      )}

      <div className={styles.adminFilters}>
        <label htmlFor="status-filter">{t('admin.seller_applications.filters.label')}</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as SellerApplicationStatus | 'all')}
          className={styles.filterSelect}
        >
          <option value="all">{t('admin.seller_applications.filters.all')}</option>
          <option value="pending">{t('admin.seller_applications.status.pending')}</option>
          <option value="under_review">{t('admin.seller_applications.status.under_review')}</option>
          <option value="approved">{t('admin.seller_applications.status.approved')}</option>
          <option value="rejected">{t('admin.seller_applications.status.rejected')}</option>
          <option value="revision_requested">{t('admin.seller_applications.status.revision_requested')}</option>
        </select>
      </div>

      <div className={styles.applicationsGrid}>
        {filteredApplications.length === 0 ? (
          <div className={styles.noApplications}>
            <p>
              {filter === 'all'
                ? t('admin.seller_applications.empty.none')
                : t('admin.seller_applications.empty.none_with_status', { status: t(`admin.seller_applications.status.${filter}`) })}
            </p>
          </div>
        ) : (
          filteredApplications.map(application => (
            <div key={application.id} className={styles.applicationCard}>
              <div className={styles.applicationHeader}>
                <div className={styles.businessInfo}>
                  <h3>{application.business_name}</h3>
                  <span className={getStatusBadge(application.status)}>
                    {application.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className={styles.applicationId}>#{application.id}</div>
              </div>

              <div className={styles.applicationDetails}>
                <div className={styles.detailRow}>
                  <strong>{t('admin.seller_applications.labels.applicant')}</strong> {application.user_name} ({application.user_email})
                </div>
                <div className={styles.detailRow}>
                  <strong>{t('admin.seller_applications.labels.type')}</strong> {application.seller_type.replace('_', ' ')}
                </div>
                <div className={styles.detailRow}>
                  <strong>{t('admin.seller_applications.labels.submitted')}</strong> {formatDate(application.submitted_at)}
                </div>
                <div className={styles.detailRow}>
                  <strong>{t('admin.seller_applications.labels.portfolio')}</strong>
                  <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer">
                    {t('admin.seller_applications.links.view_portfolio')}
                  </a>
                </div>
                {application.social_media_url && (
                  <div className={styles.detailRow}>
                    <strong>{t('admin.seller_applications.labels.social_media')}</strong>
                    <a href={application.social_media_url} target="_blank" rel="noopener noreferrer">
                      {t('admin.seller_applications.links.view_profile')}
                    </a>
                  </div>
                )}
              </div>

              <div className={styles.motivationSection}>
                <strong>{t('admin.seller_applications.labels.motivation')}</strong>
                <p>{application.motivation}</p>
              </div>

              {application.images.length > 0 && (
                <div className={styles.imagesSection}>
                  <strong>{t('admin.seller_applications.labels.workshop_photos')}</strong>
                  <div className={styles.imagesGrid}>
                    {application.images.slice(0, 3).map(image => (
                      <img
                        key={image.id}
                        src={image.image}
                        alt={image.description}
                        className={styles.workshopImage}
                        onClick={() => window.open(image.image, '_blank')}
                      />
                    ))}
                    {application.images.length > 3 && (
                      <div className={styles.moreImages}>+{t('admin.seller_applications.labels.more_images', { count: application.images.length - 3 })}</div>
                    )}
                  </div>
                </div>
              )}

              {(application.admin_notes || application.rejection_reason) && (
                <div className={styles.adminNotesSection}>
                  {application.admin_notes && (
                    <div className={styles.note}>
                      <strong>{t('admin.seller_applications.labels.admin_notes')}</strong> {application.admin_notes}
                    </div>
                  )}
                  {application.rejection_reason && (
                    <div className={styles.rejectionReason}>
                      <strong>{t('admin.seller_applications.labels.rejection_reason')}</strong> {application.rejection_reason}
                    </div>
                  )}
                </div>
              )}

              {application.status === 'pending' && (
                <div className={styles.actionButtons}>
                  <button
                    className={styles.btnApprove}
                    onClick={() => handleApprove(application.id)}
                    disabled={processingId === application.id}
                  >
                    {processingId === application.id ? t('admin.seller_applications.actions.approving') : t('admin.seller_applications.actions.approve')}
                  </button>
                  <button
                    className={styles.btnReject}
                    onClick={() => handleReject(application.id)}
                    disabled={processingId === application.id}
                  >
                    {processingId === application.id ? t('admin.seller_applications.actions.rejecting') : t('admin.seller_applications.actions.reject')}
                  </button>
                </div>
              )}

              {application.approved_by_name && (
                <div className={styles.approvalInfo}>
                  <small>{t('admin.seller_applications.labels.approved_by', { name: application.approved_by_name })}</small>
                </div>
              )}

              {application.rejected_by_name && (
                <div className={styles.rejectionInfo}>
                  <small>{t('admin.seller_applications.labels.rejected_by', { name: application.rejected_by_name })}</small>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerApplicationList;
