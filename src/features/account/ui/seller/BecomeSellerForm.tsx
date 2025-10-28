import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { useAuth } from '@/features/auth/state/AuthContext';
// Use AuthContext for 2FA and seller status checks
import ImageUpload from '@/shared/ui/image-upload/ImageUpload';
import Select from '@/shared/ui/select/Select';
import type { Option } from '@/shared/ui/select/Select';
import styles from './BecomeSellerForm.module.css';

// Options are translated within the component using i18n

const BecomeSellerForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { submitSellerApplication, user, getSellerApplicationStatus, getTwoFactorStatus } = useAuth();
  const [workshopFiles, setWorkshopFiles] = useState<File[]>([]);
  const [sellerType, setSellerType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [sellerStatus, setSellerStatus] = useState<{
    has_application: boolean;
    is_seller: boolean;
    status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'revision_requested';
    application_id?: number;
    submitted_at?: string;
    admin_notes?: string;
    rejection_reason?: string;
  } | null>(null);

  const sellerTypeOptions = useMemo<Option[]>(() => [
    { value: 'manufacturer', label: t('account.seller.form.types.manufacturer') },
    { value: 'designer', label: t('account.seller.form.types.designer') },
    { value: 'restorer', label: t('account.seller.form.types.restorer') },
    { value: 'retailer', label: t('account.seller.form.types.retailer') },
    { value: 'artisan', label: t('account.seller.form.types.artisan') },
  ], [t]);

  // Authoritative 2FA check from API (with fallback to user flags)
  useEffect(() => {
    const loadTwoFactor = async () => {
      try {
        setTwoFactorLoading(true);
        const resp = await getTwoFactorStatus();
        setTwoFactorEnabled(!!resp.two_factor_enabled);
      } catch (err) {
        // Fallback to user flags if API not available
        setTwoFactorEnabled(
          (user?.two_factor_enabled as boolean | undefined) || (user as any)?.is_two_factor_enabled || false,
        );
      } finally {
        setTwoFactorLoading(false);
      }
    };

    void loadTwoFactor();
  }, [user?.two_factor_enabled, (user as any)?.is_two_factor_enabled]);

  // Load seller application status
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const status = await getSellerApplicationStatus();
        if (mounted) setSellerStatus(status);
      } catch {
        if (mounted) setSellerStatus(null);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [getSellerApplicationStatus]);

  const has2FAEnabled =
    twoFactorEnabled !== null
      ? twoFactorEnabled
      : (user?.two_factor_enabled as boolean | undefined) || (user as any)?.is_two_factor_enabled || false;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!has2FAEnabled) {
        throw new Error(
          t('account.seller.errors.require_2fa')
        );
      }

      const formData = new FormData(event.currentTarget);
      const businessName = formData.get('businessName') as string;
      const motivation = formData.get('motivation') as string;
      const portfolio = formData.get('portfolio') as string;

      if (!businessName || !sellerType || !motivation || !portfolio) {
        throw new Error(t('account.seller.errors.required_fields'));
      }

      if (workshopFiles.length < 3) {
        throw new Error(t('account.seller.errors.min_photos'));
      }

      await submitSellerApplication({
        businessName,
        sellerType,
        motivation,
        portfolio,
        socialMedia: (formData.get('socialMedia') as string) || undefined,
        workshopPhotos: workshopFiles,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('account.seller.errors.submit_failed');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // If user already a seller, show message and exit
  if (user?.role === 'seller' || user?.is_verified_seller) {
    return (
      <Layout>
        <div className={styles['become-seller-page']}>
          <div className={styles['seller-form-header']}>
            <h1 className="heading-lg">{t('account.seller.page_title')}</h1>
            <p className="body-lg">{t('account.seller.already_seller')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If there's an application in review, show gate
  if (sellerStatus?.has_application && (sellerStatus.status === 'pending' || sellerStatus.status === 'under_review' || sellerStatus.status === 'revision_requested')) {
    return (
      <Layout>
        <div className={styles['become-seller-page']}>
          <div className={styles['seller-form-header']}>
            <h1 className="heading-lg">{t('account.seller.page_title')}</h1>
            <p className="body-lg">{t('account.seller.in_review_message', { status: sellerStatus.status === 'under_review' ? t('account.seller.status.under_review') : (sellerStatus.status || '').replace('_',' ') })}</p>
          </div>
          <div className={styles['center-gate']}>
            <div className={styles['gate-card']}>
              <div className={styles['gate-icon']} aria-hidden>⏳</div>
              <h3 className={cx('heading-md', styles['gate-title'])}>{t('account.seller.app_in_progress')}</h3>
              <p className={cx('body-md', styles['gate-text'])}>
                {t('account.seller.review_notice')}
              </p>
              <button
                type="button"
                className={cx(styles['seller-btn'], styles['seller-btn-secondary'])}
                onClick={() => navigate('/settings')}
              >
                {t('account.seller.go_to_settings')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // If application was rejected, allow re-submission by showing form with a notice

  // Show lightweight check state while verifying 2FA
  if (twoFactorLoading && !has2FAEnabled) {
    return (
      <Layout>
        <div className={styles['become-seller-page']}>
          <div className={styles['seller-form-header']}>
            <h1 className="heading-lg">{t('account.seller.page_title')}</h1>
            <p className="body-lg">{t('account.seller.checking_2fa')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If 2FA is not enabled, show only the CTA and hide the form
  if (!has2FAEnabled) {
    return (
      <Layout>
        <div className={styles['become-seller-page']}>
          <div className={styles['seller-form-header']}>
            <h1 className="heading-lg">{t('account.seller.page_title')}</h1>
            <p className="body-lg">{t('account.seller.2fa_required')}</p>
          </div>
          <div className={styles['center-gate']}>
            <div className={styles['gate-card']}>
              <div className={styles['gate-icon']} aria-hidden>🔒</div>
              <h3 className={cx('heading-md', styles['gate-title'])}>{t('account.seller.enable_2fa_title')}</h3>
              <p className={cx('body-md', styles['gate-text'])}>
                {t('account.seller.enable_2fa_description')}
              </p>
              <button
                type="button"
                className={cx(styles['seller-btn'], styles['seller-btn-primary'])}
                onClick={() => navigate('/settings')}
                aria-label="Activate two-factor authentication in settings"
              >
                {t('account.seller.activate_2fa_cta')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['become-seller-page']}>
        <div className={styles['seller-form-header']}>
          <h1 className="heading-lg">{t('account.seller.page_title')}</h1>
          <p className="body-lg">{t('account.seller.page_intro')}</p>
        </div>

        {sellerStatus?.status === 'rejected' && (
          <div className={styles.alertError}>
            {t('account.seller.rejected_notice')}
            {sellerStatus.rejection_reason ? ` ${t('account.seller.rejection_reason_prefix')} ${sellerStatus.rejection_reason}` : ''}
          </div>
        )}

        {error && <div className={styles.alertError}>{error}</div>}

        {success && (
          <div className={styles.alertSuccess}>{t('account.seller.submit_success')}</div>
        )}

        <form onSubmit={handleSubmit} className={styles['premium-form']}>
          <div className={styles['form-section']}>
            <div className={styles['seller-section-header']}>
              <span className={styles.sectionEyebrow}>{t('account.seller.step_1')}</span>
              <h2 className="heading-md">{t('account.seller.business_info_title')}</h2>
              <p className="body-md">{t('account.seller.business_info_description')}</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles['seller-form-group']}>
                <label htmlFor="businessName" className={styles['form-label']}>{t('account.seller.form.business_name_label')}</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  className={styles['input-field']}
                  required
                  placeholder={t('account.seller.form.business_name_placeholder')}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="sellerType" className={styles['form-label']}>{t('account.seller.form.seller_type_label')}</label>
                <Select
                  options={sellerTypeOptions}
                  value={sellerType}
                  onChange={setSellerType}
                  placeholder={t('account.seller.form.seller_type_placeholder')}
                />
              </div>

              <div className={cx(styles.formGroup, styles.fullRow)}>
                <label htmlFor="motivation" className={styles['form-label']}>{t('account.seller.form.motivation_label')}</label>
                <textarea
                  id="motivation"
                  name="motivation"
                  rows={5}
                  className={cx(styles['input-field'], styles['textarea-field'])}
                  placeholder={t('account.seller.form.motivation_placeholder')}
                  required
                ></textarea>
                <small className={styles.hint}>{t('account.seller.form.motivation_hint')}</small>
              </div>
            </div>
          </div>

          <div className={styles['form-section']}>
            <div className={styles['seller-section-header']}>
              <span className={styles.sectionEyebrow}>{t('account.seller.step_2')}</span>
              <h2 className="heading-md">{t('account.seller.verification_title')}</h2>
              <p className="body-md">{t('account.seller.verification_description')}</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="portfolio" className={styles['form-label']}>{t('account.seller.form.portfolio_label')}</label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  className={styles['input-field']}
                  placeholder={t('account.seller.form.portfolio_placeholder')}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="socialMedia" className={styles['form-label']}>{t('account.seller.form.social_media_label')}</label>
                <input
                  type="url"
                  id="socialMedia"
                  name="socialMedia"
                  className={styles['input-field']}
                  placeholder={t('account.seller.form.social_media_placeholder')}
                />
              </div>

              <div className={cx(styles.formGroup, styles.fullRow)}>
                <label htmlFor="workshopPhotos" className={styles['form-label']}>{t('account.seller.form.workshop_photos_label')}</label>
                <p className={styles['form-hint']}>{t('account.seller.form.workshop_photos_hint')}</p>
                <div className={styles['upload-container']}>
                  <ImageUpload files={workshopFiles} setFiles={setWorkshopFiles} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles['seller-form-actions']}>
            <span className={styles.actionsNote}>{t('account.seller.form.actions_note')}</span>
            <div>
              <button
                type="button"
                className={cx(styles['seller-btn'], styles['seller-btn-secondary'])}
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                {t('account.seller.actions.cancel')}
              </button>
              <span style={{ display: 'inline-block', width: 12 }} />
              <button
                type="submit"
                className={cx(styles['seller-btn'], styles['seller-btn-primary'])}
                disabled={isLoading}
              >
                {isLoading ? t('account.seller.actions.submitting') : t('account.seller.actions.submit_application')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export default BecomeSellerForm;
