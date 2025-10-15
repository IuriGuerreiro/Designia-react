import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useSellerApplications } from '@/features/admin/hooks';
import type { SellerApplicationStatus } from '@/features/admin/model';
import styles from './SellerApplicationList.module.css';

const SellerApplicationList = () => {
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
    new Date(dateString).toLocaleDateString('en-US', {
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
    if (!window.confirm('Are you sure you want to approve this application?')) return;

    try {
      setProcessingId(applicationId);
      await updateStatus(applicationId, 'approve');
      alert('Application approved successfully!');
    } catch (err: any) {
      alert(err?.message || 'Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: number) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return;

    try {
      setProcessingId(applicationId);
      await updateStatus(applicationId, 'reject', { reason: reason || undefined });
      alert('Application rejected successfully!');
    } catch (err: any) {
      alert(err?.message || 'Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  if (!user || !isAdmin()) {
    return (
      <div className={styles.adminAccessDenied}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.adminLoading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className={styles.sellerApplicationsAdmin}>
      <div className={styles.adminHeader}>
        <h1>Seller Applications Management</h1>
        <div className={styles.adminStats}>
          <span className={styles.stat}>
            Total: {applications.length}
          </span>
          <span className={`${styles.stat} ${styles.statPending}`}>
            Pending: {applications.filter(app => app.status === 'pending').length}
          </span>
          <span className={`${styles.stat} ${styles.statApproved}`}>
            Approved: {applications.filter(app => app.status === 'approved').length}
          </span>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => fetchApplications()}>Retry</button>
        </div>
      )}

      <div className={styles.adminFilters}>
        <label htmlFor="status-filter">Filter by status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as SellerApplicationStatus | 'all')}
          className={styles.filterSelect}
        >
          <option value="all">All Applications</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="revision_requested">Revision Requested</option>
        </select>
      </div>

      <div className={styles.applicationsGrid}>
        {filteredApplications.length === 0 ? (
          <div className={styles.noApplications}>
            <p>No applications found{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
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
                  <strong>Applicant:</strong> {application.user_name} ({application.user_email})
                </div>
                <div className={styles.detailRow}>
                  <strong>Type:</strong> {application.seller_type.replace('_', ' ')}
                </div>
                <div className={styles.detailRow}>
                  <strong>Submitted:</strong> {formatDate(application.submitted_at)}
                </div>
                <div className={styles.detailRow}>
                  <strong>Portfolio:</strong>
                  <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer">
                    View Portfolio
                  </a>
                </div>
                {application.social_media_url && (
                  <div className={styles.detailRow}>
                    <strong>Social Media:</strong>
                    <a href={application.social_media_url} target="_blank" rel="noopener noreferrer">
                      View Profile
                    </a>
                  </div>
                )}
              </div>

              <div className={styles.motivationSection}>
                <strong>Motivation:</strong>
                <p>{application.motivation}</p>
              </div>

              {application.images.length > 0 && (
                <div className={styles.imagesSection}>
                  <strong>Workshop Photos:</strong>
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
                      <div className={styles.moreImages}>+{application.images.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}

              {(application.admin_notes || application.rejection_reason) && (
                <div className={styles.adminNotesSection}>
                  {application.admin_notes && (
                    <div className={styles.note}>
                      <strong>Admin Notes:</strong> {application.admin_notes}
                    </div>
                  )}
                  {application.rejection_reason && (
                    <div className={styles.rejectionReason}>
                      <strong>Rejection Reason:</strong> {application.rejection_reason}
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
                    {processingId === application.id ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    className={styles.btnReject}
                    onClick={() => handleReject(application.id)}
                    disabled={processingId === application.id}
                  >
                    {processingId === application.id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              )}

              {application.approved_by_name && (
                <div className={styles.approvalInfo}>
                  <small>Approved by: {application.approved_by_name}</small>
                </div>
              )}

              {application.rejected_by_name && (
                <div className={styles.rejectionInfo}>
                  <small>Rejected by: {application.rejected_by_name}</small>
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