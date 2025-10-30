import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { useAuth } from '@/features/auth/state/AuthContext';
// Use AuthContext for 2FA and seller status checks
import ImageUpload from '@/shared/ui/image-upload/ImageUpload';
import Select from '@/shared/ui/select/Select';
import type { Option } from '@/shared/ui/select/Select';
import {
  FormContainer,
  FormSection,
  FormGrid,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  Button,
  Loading,
  FormActions,
  type FormTranslations
} from '@/shared/ui/forms';

// Options are translated within the component using i18n

const BecomeSellerForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { submitSellerApplication, user, getSellerApplicationStatus, getTwoFactorStatus } = useAuth();
  
  // Form translations
  const formTranslations: FormTranslations = {
    selectOption: t('forms.select_option'),
    requiredField: t('forms.required_field'),
    optional: t('forms.optional'),
    loading: t('forms.loading'),
    save: t('forms.save'),
    cancel: t('forms.cancel'),
    submit: t('forms.submit'),
    edit: t('forms.edit'),
    delete: t('forms.delete'),
    confirm: t('forms.confirm'),
    back: t('forms.back'),
    next: t('forms.next'),
    previous: t('forms.previous'),
    finish: t('forms.finish'),
    close: t('forms.close'),
    search: t('forms.search'),
    clear: t('forms.clear'),
    upload: t('forms.upload'),
    download: t('forms.download'),
    browse: t('forms.browse'),
    chooseFile: t('forms.choose_file'),
    dragDrop: t('forms.drag_drop'),
    processing: t('forms.processing'),
    success: t('forms.success'),
    error: t('forms.error'),
    warning: t('forms.warning'),
    info: t('forms.info')
  };
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
  }, [user?.two_factor_enabled, (user as any)?.is_two_factor_enabled, getTwoFactorStatus]);

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
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: 'var(--space-xl, 32px) var(--space-lg, 24px)',
          fontFamily: 'var(--font-sans, "Inter", sans-serif)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-3xl, 64px) var(--space-xl, 32px)', 
            background: 'var(--surface-glass, rgba(255, 255, 255, 0.95))',
            border: '1px solid var(--border-soft, rgba(229, 231, 235, 0.6))',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-md, 0 4px 16px rgba(15, 23, 42, 0.12))'
          }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 600, 
              color: 'var(--color-text-primary, #1A1A1A)', 
              margin: '0 0 var(--space-md, 16px) 0',
              fontFamily: 'var(--font-serif, "Playfair Display", serif)'
            }}>
              {t('account.seller.page_title')}
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: 'var(--color-text-secondary, #6B7280)', 
              margin: 0,
              lineHeight: 1.6
            }}>
              {t('account.seller.already_seller')}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // If there's an application in review, show gate
  if (sellerStatus?.has_application && (sellerStatus.status === 'pending' || sellerStatus.status === 'under_review' || sellerStatus.status === 'revision_requested')) {
    return (
      <Layout>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: 'var(--space-xl, 32px) var(--space-lg, 24px)',
          fontFamily: 'var(--font-sans, "Inter", sans-serif)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-xl, 32px) 0 var(--space-lg, 24px)', 
            borderBottom: '1px solid var(--color-border, #E5E7EB)', 
            marginBottom: 'var(--space-xl, 32px)' 
          }}>
            <h1 style={{ 
              fontFamily: 'var(--font-serif, "Playfair Display", serif)', 
              fontSize: '36px', 
              fontWeight: 600, 
              color: 'var(--color-text-primary, #1A1A1A)', 
              margin: '0 0 var(--space-sm, 8px) 0',
              lineHeight: 1.2
            }}>
              {t('account.seller.page_title')}
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: 'var(--color-text-secondary, #6B7280)', 
              margin: 0,
              lineHeight: 1.5
            }}>
              {t('account.seller.in_review_message', { status: sellerStatus.status === 'under_review' ? t('account.seller.status.under_review') : (sellerStatus.status || '').replace('_',' ') })}
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <div style={{
              background: 'var(--surface-glass, rgba(255, 255, 255, 0.95))',
              border: '1px solid var(--border-soft, rgba(229, 231, 235, 0.6))',
              borderRadius: '16px',
              padding: 'var(--space-3xl, 64px)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md, 0 4px 16px rgba(15, 23, 42, 0.12))',
              maxWidth: '400px'
            }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: 'var(--space-lg, 24px)' 
              }}>
                ⏳
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 600, 
                color: 'var(--color-text-primary, #1A1A1A)', 
                margin: '0 0 var(--space-md, 16px) 0'
              }}>
                {t('account.seller.app_in_progress')}
              </h3>
              <p style={{ 
                fontSize: '16px', 
                color: 'var(--color-text-secondary, #6B7280)', 
                margin: 0,
                lineHeight: 1.5
              }}>
                {t('account.seller.review_notice')}
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/settings')}
                style={{ marginTop: 'var(--space-xl, 32px)' }}
              >
                {t('account.seller.go_to_settings')}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show lightweight check state while verifying 2FA
  if (twoFactorLoading && !has2FAEnabled) {
    return (
      <Layout>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: 'var(--space-xl, 32px) var(--space-lg, 24px)',
          fontFamily: 'var(--font-sans, "Inter", sans-serif)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-3xl, 64px) var(--space-xl, 32px)', 
            background: 'var(--surface-glass, rgba(255, 255, 255, 0.95))',
            border: '1px solid var(--border-soft, rgba(229, 231, 235, 0.6))',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-md, 0 4px 16px rgba(15, 23, 42, 0.12))'
          }}>
            <Loading text={t('account.seller.checking_2fa')} translations={formTranslations} />
          </div>
        </div>
      </Layout>
    );
  }

  // If 2FA is not enabled, show only the CTA and hide the form
  if (!has2FAEnabled) {
    return (
      <Layout>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: 'var(--space-xl, 32px) var(--space-lg, 24px)',
          fontFamily: 'var(--font-sans, "Inter", sans-serif)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-xl, 32px) 0 var(--space-lg, 24px)', 
            borderBottom: '1px solid var(--color-border, #E5E7EB)', 
            marginBottom: 'var(--space-xl, 32px)' 
          }}>
            <h1 style={{ 
              fontFamily: 'var(--font-serif, "Playfair Display", serif)', 
              fontSize: '36px', 
              fontWeight: 600, 
              color: 'var(--color-text-primary, #1A1A1A)', 
              margin: '0 0 var(--space-sm, 8px) 0',
              lineHeight: 1.2
            }}>
              {t('account.seller.page_title')}
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: 'var(--color-text-secondary, #6B7280)', 
              margin: 0,
              lineHeight: 1.5
            }}>
              {t('account.seller.2fa_required')}
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <div style={{
              background: 'var(--surface-glass, rgba(255, 255, 255, 0.95))',
              border: '1px solid var(--border-soft, rgba(229, 231, 235, 0.6))',
              borderRadius: '16px',
              padding: 'var(--space-3xl, 64px)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md, 0 4px 16px rgba(15, 23, 42, 0.12))',
              maxWidth: '400px'
            }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: 'var(--space-lg, 24px)' 
              }}>
                🔒
              </div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 600, 
                color: 'var(--color-text-primary, #1A1A1A)', 
                margin: '0 0 var(--space-md, 16px) 0'
              }}>
                {t('account.seller.enable_2fa_title')}
              </h3>
              <p style={{ 
                fontSize: '16px', 
                color: 'var(--color-text-secondary, #6B7280)', 
                margin: '0 0 var(--space-xl, 32px) 0',
                lineHeight: 1.5
              }}>
                {t('account.seller.enable_2fa_description')}
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={() => navigate('/settings')}
                aria-label="Activate two-factor authentication in settings"
              >
                {t('account.seller.activate_2fa_cta')}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: 'var(--space-xl, 32px) var(--space-lg, 24px)',
        fontFamily: 'var(--font-sans, "Inter", sans-serif)'
      }}>
        {/* Header Section */}
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-xl, 32px) 0 var(--space-lg, 24px)', 
          borderBottom: '1px solid var(--color-border, #E5E7EB)', 
          marginBottom: 'var(--space-xl, 32px)' 
        }}>
          <h1 style={{ 
            fontFamily: 'var(--font-serif, "Playfair Display", serif)', 
            fontSize: '36px', 
            fontWeight: 600, 
            color: 'var(--color-text-primary, #1A1A1A)', 
            margin: '0 0 var(--space-sm, 8px) 0',
            lineHeight: 1.2
          }}>
            {t('account.seller.page_title')}
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--color-text-secondary, #6B7280)', 
            margin: 0,
            lineHeight: 1.5
          }}>
            {t('account.seller.page_intro')}
          </p>
        </div>

        {/* Rejection Notice */}
        {sellerStatus?.status === 'rejected' && (
          <div style={{
            borderRadius: '16px',
            border: '1px solid color-mix(in srgb, var(--color-error, #EF4444) 45%, transparent)',
            background: 'color-mix(in srgb, var(--color-error, #EF4444) 12%, var(--color-surface, #FFFFFF) 88%)',
            padding: '16px 24px',
            marginBottom: 'var(--space-lg, 24px)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-error, #EF4444)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="18"/>
              </svg>
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--color-error, #EF4444)', fontWeight: 600 }}>
                {t('account.seller.rejected_notice')}
              </h4>
              {sellerStatus.rejection_reason && (
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary, #6B7280)', lineHeight: 1.5 }}>
                  {t('account.seller.rejection_reason_prefix')} {sellerStatus.rejection_reason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{
            borderRadius: '16px',
            border: '1px solid color-mix(in srgb, var(--color-error, #EF4444) 45%, transparent)',
            background: 'color-mix(in srgb, var(--color-error, #EF4444) 12%, var(--color-surface, #FFFFFF) 88%)',
            padding: '16px 24px',
            marginBottom: 'var(--space-lg, 24px)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-error, #EF4444)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="18"/>
              </svg>
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--color-error, #EF4444)', fontWeight: 600 }}>
                Error
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary, #6B7280)', lineHeight: 1.5 }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div style={{
            borderRadius: '16px',
            border: '1px solid color-mix(in srgb, var(--color-success, #10B981) 45%, transparent)',
            background: 'color-mix(in srgb, var(--color-success, #10B981) 12%, var(--color-surface, #FFFFFF) 88%)',
            padding: '16px 24px',
            marginBottom: 'var(--space-lg, 24px)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-success, #10B981)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--color-success, #10B981)', fontWeight: 600 }}>
                Success
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary, #6B7280)', lineHeight: 1.5 }}>
                {t('account.seller.submit_success')}
              </p>
            </div>
          </div>
        )}
        
        {/* Main Form */}
        <FormContainer>
          <form onSubmit={handleSubmit}>
            {/* Business Information Section */}
            <FormSection 
              title={
                <span style={{ 
                  fontSize: '12px', 
                  color: 'var(--color-primary, #3B82F6)', 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.12em',
                  display: 'block',
                  marginBottom: 'var(--space-sm, 8px)'
                }}>
                  {t('account.seller.step_1')}
                </span>
              }
              description={
                <>
                  <h2 style={{ 
                    fontSize: '20px', 
                    fontWeight: 600, 
                    color: 'var(--color-text-primary, #1A1A1A)', 
                    margin: '0 0 var(--space-sm, 8px) 0',
                    fontFamily: 'var(--font-serif, "Playfair Display", serif)'
                  }}>
                    {t('account.seller.business_info_title')}
                  </h2>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--color-text-secondary, #6B7280)', 
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {t('account.seller.business_info_description')}
                  </p>
                </>
              }
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8"/>
                  <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z"/>
                </svg>
              }
            >
              <FormGrid>
                <FormGroup fullWidth>
                  <FormLabel required htmlFor="businessName">{t('account.seller.form.business_name_label')}</FormLabel>
                  <FormInput 
                    id="businessName"
                    name="businessName"
                    required
                    placeholder={t('account.seller.form.business_name_placeholder')}
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel required htmlFor="sellerType">{t('account.seller.form.seller_type_label')}</FormLabel>
                  <Select
                    name="sellerType"
                    options={sellerTypeOptions}
                    value={sellerType}
                    onChange={setSellerType}
                    placeholder={t('account.seller.form.seller_type_placeholder')}
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel required htmlFor="motivation">{t('account.seller.form.motivation_label')}</FormLabel>
                  <FormTextarea 
                    id="motivation"
                    name="motivation"
                    showCharacterCounter
                    maxLength={1000}
                    placeholder={t('account.seller.form.motivation_placeholder')}
                    required
                  />
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--color-text-muted, #9CA3AF)', 
                    marginTop: 'var(--space-xs, 4px)',
                    lineHeight: 1.4
                  }}>
                    {t('account.seller.form.motivation_hint')}
                  </div>
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Verification Section */}
            <FormSection 
              title={
                <span style={{ 
                  fontSize: '12px', 
                  color: 'var(--color-primary, #3B82F6)', 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.12em',
                  display: 'block',
                  marginBottom: 'var(--space-sm, 8px)'
                }}>
                  {t('account.seller.step_2')}
                </span>
              }
              description={
                <>
                  <h2 style={{ 
                    fontSize: '20px', 
                    fontWeight: 600, 
                    color: 'var(--color-text-primary, #1A1A1A)', 
                    margin: '0 0 var(--space-sm, 8px) 0',
                    fontFamily: 'var(--font-serif, "Playfair Display", serif)'
                  }}>
                    {t('account.seller.verification_title')}
                  </h2>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--color-text-secondary, #6B7280)', 
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {t('account.seller.verification_description')}
                  </p>
                </>
              }
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            >
              <FormGrid>
                <FormGroup fullWidth>
                  <FormLabel required htmlFor="portfolio">{t('account.seller.form.portfolio_label')}</FormLabel>
                  <FormInput 
                    type="url"
                    id="portfolio"
                    name="portfolio"
                    placeholder={t('account.seller.form.portfolio_placeholder')}
                    required
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel htmlFor="socialMedia">{t('account.seller.form.social_media_label')}</FormLabel>
                  <FormInput 
                    type="url"
                    id="socialMedia"
                    name="socialMedia"
                    placeholder={t('account.seller.form.social_media_placeholder')}
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel required htmlFor="workshopPhotos">{t('account.seller.form.workshop_photos_label')}</FormLabel>
                  <div style={{ 
                    fontSize: '14px', 
                    color: 'var(--color-text-muted, #9CA3AF)', 
                    margin: '0 0 var(--space-md, 16px) 0',
                    lineHeight: 1.4
                  }}>
                    {t('account.seller.form.workshop_photos_hint')}
                  </div>
                  <ImageUpload 
                    files={workshopFiles} 
                    setFiles={setWorkshopFiles}
                    minFiles={3}
                    maxFiles={10}
                    maxFileSize={10 * 1024 * 1024}
                    allowedExtensions={['jpg', 'jpeg', 'png', 'webp']}
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Form Actions */}
            <FormActions>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--color-text-muted, #9CA3AF)', 
                marginBottom: 'var(--space-md, 16px)',
                textAlign: 'center'
              }}>
                {t('account.seller.form.actions_note')}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md, 16px)' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  disabled={isLoading}
                >
                  {t('account.seller.actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? t('account.seller.actions.submitting') : t('account.seller.actions.submit_application')}
                </Button>
              </div>
            </FormActions>
          </form>
        </FormContainer>
      </div>
    </Layout>
  );
};

export default BecomeSellerForm;