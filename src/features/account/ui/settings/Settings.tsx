import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/app/layout';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useLanguage } from '@/shared/state/LanguageContext';
import TwoFactorAuth from '../security/TwoFactorAuth';
import PasswordSetup from '../security/PasswordSetup';
import ChangePasswordModal from '../security/ChangePasswordModal';
import styles from './Settings.module.css';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

type SettingsTab = 'account' | 'security' | 'privacy' | 'legal' | 'preferences' | 'developer';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAdmin, changeLanguage: changeUserLanguage, getSellerApplicationStatus } = useAuth();
  const { language, changeLanguage: changeLocalLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();
  const [sellerStatus, setSellerStatus] = useState<{
    has_application: boolean;
    is_seller: boolean;
    status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'revision_requested';
    application_id?: number;
    submitted_at?: string;
    admin_notes?: string;
    rejection_reason?: string;
  } | null>(null);
  const [sellerStatusLoading, setSellerStatusLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setSellerStatusLoading(true);
        const status = await getSellerApplicationStatus();
        if (mounted) setSellerStatus(status);
      } catch {
        if (mounted) setSellerStatus(null);
      } finally {
        if (mounted) setSellerStatusLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Password change flow handled in a modal
  const [showChangePw, setShowChangePw] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Always update i18n immediately so the UI switches right away
      changeLocalLanguage(languageCode);

      // Persist only supported account languages
      if (languageCode === 'en' || languageCode === 'pt') {
        await changeUserLanguage(languageCode);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Show the currently active i18n language in the UI
  const currentLanguage = language || user?.language || 'en';

  const renderSecurityTab = () => (
    <>
      <div className={styles.settingsCard}>
        <h3>{t('settings.two_factor_title')}</h3>
        <p className={styles.cardDescription}>{t('settings.two_factor_description')}</p>
        <TwoFactorAuth />
      </div>
      <div className={styles.settingsCard}>
        <h3>{t('settings.password_title')}</h3>
        <p className={styles.cardDescription}>
          {user?.is_oauth_only_user
            ? t('settings.password_oauth_description')
            : t('settings.password_change_description')}
        </p>
        {user?.is_oauth_only_user ? (
          <PasswordSetup />
        ) : (
          <div className={styles.accountActions}>
            <button className={styles.settingsBtn} onClick={() => setShowChangePw(true)}>{t('settings.change_password_button')}</button>
          </div>
        )}
      </div>
    </>
  );

const renderPrivacyTab = () => (
  <div className={styles.settingsCard}>
    <h3>{t('settings.privacy_title')}</h3>
    <div className={styles.privacyOption}>
      <div>
        <strong>{t('settings.privacy_private_label')}</strong>
        <p>{t('settings.privacy_private_description')}</p>
      </div>
      <div className={styles.toggleField}>
        <input
          id="settings-private-toggle"
          type="checkbox"
          checked={isPrivate}
          onChange={() => setIsPrivate((prev) => !prev)}
        />
        <label htmlFor="settings-private-toggle">
          {isPrivate ? t('settings.privacy_private_enabled') : t('settings.privacy_private_disabled')}
        </label>
      </div>
    </div>
  </div>
);

  const languageButtons = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
  ];

  const renderPreferencesTab = () => (
    <div className={styles.settingsCard}>
      <h3>{t('settings.language_prefs_title')}</h3>
      <p className={styles.cardDescription}>{t('settings.language_prefs_description')}</p>
      <div className={styles.languageSelector}>
        {languageButtons.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={cx(
              styles.settingsBtn,
              currentLanguage !== code && styles.settingsBtnSecondary,
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.currentLanguageInfo}>
        <small>
          {t('settings.current_language_label')} {currentLanguage === 'pt' ? 'Portuguese' : 'English'}
          {(user?.language === 'en' || user?.language === 'pt') && ` ${t('settings.saved_to_account_suffix')}`}
        </small>
      </div>
    </div>
  );

  const renderLegalTab = () => (
    <>
      <div className={styles.settingsCard}>
        <h3>{t('settings.privacy_policy_title')}</h3>
        <p className={styles.cardDescription}>{t('settings.privacy_policy_description')}</p>
        <button className={cx(styles.settingsBtn, styles.settingsBtnSecondary)} onClick={() => window.open('/privacy-policy', '_blank')}>
          {t('settings.view_privacy_policy_button')}
        </button>
      </div>
      <div className={styles.settingsCard}>
        <h3>{t('settings.terms_title')}</h3>
        <p className={styles.cardDescription}>{t('settings.terms_description')}</p>
        <button className={cx(styles.settingsBtn, styles.settingsBtnSecondary)} onClick={() => window.open('/terms-of-use', '_blank')}>
          {t('settings.view_terms_button')}
        </button>
      </div>
    </>
  );

  const renderAccountTab = () => (
    <>
      <div className={styles.settingsCard}>
        <h3>{t('settings.account_info_title')}</h3>
        <div className={styles.accountInfo}>
          <div className={styles.infoGroup}>
            <label>{t('settings.username_label')}</label>
            <p>{user?.username}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>{t('settings.email_label')}</label>
            <p>{user?.email}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>{t('settings.name_label')}</label>
            <p>
              {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div className={styles.infoGroup}>
            <label>{t('settings.account_type_label')}</label>
            <p className={user?.is_oauth_only_user ? styles.statusWarning : styles.statusSuccess}>
              {user?.is_oauth_only_user ? t('settings.account_type_oauth_only') : t('settings.account_type_full')}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.settingsCard}>
        <h3>{t('settings.account_mgmt_title')}</h3>
        <p className={styles.cardDescription}>{t('settings.account_mgmt_description')}</p>
        <div className={styles.accountActions}>
          <button
            className={cx(styles.settingsBtn, styles.settingsBtnSecondary)}
            onClick={() => navigate('/profile/edit')}
          >
            {t('settings.edit_profile_button')}
          </button>
          {!user?.is_verified_seller && user?.role !== 'seller' && user?.role !== 'admin' && !sellerStatusLoading && !sellerStatus?.has_application && (
            <button className={styles.settingsBtn} onClick={() => navigate('/settings/become-seller')}>
              {t('settings.become_seller_button')}
            </button>
          )}
        </div>
      </div>

      {!isAdmin() && (
        <div className={styles.settingsCard}>
          <h3>{t('settings.seller_status_title')}</h3>
          <div className={styles.accountInfo}>
            <div className={styles.infoGroup}>
              <label>{t('settings.verification_label')}</label>
              <p className={user?.is_verified_seller || user?.role === 'seller' ? styles.statusSuccess : styles.statusMuted}>
                {user?.is_verified_seller || user?.role === 'seller' ? t('settings.verification_verified') : t('settings.verification_not_verified')}
              </p>
            </div>
            {sellerStatusLoading && (
              <div className={styles.infoGroup}>
                <label>{t('settings.application_label')}</label>
                <p>{t('settings.application_checking')}</p>
              </div>
            )}
            {!sellerStatusLoading && sellerStatus?.has_application && sellerStatus?.status && (
              <div className={styles.infoGroup}>
                <label>{t('settings.application_status_label')}</label>
                <p>
                  {sellerStatus.status === 'under_review'
                    ? t('settings.application_status_under_review')
                    : sellerStatus.status === 'revision_requested'
                      ? t('settings.application_status_revision_requested')
                      : sellerStatus.status.charAt(0).toUpperCase() + sellerStatus.status.slice(1)}
                </p>
              </div>
            )}
            {!sellerStatusLoading && sellerStatus?.status === 'rejected' && sellerStatus?.rejection_reason && (
              <div className={styles.infoGroup}>
                <label>{t('settings.rejection_reason_label')}</label>
                <p className={styles.statusWarning}>{sellerStatus.rejection_reason}</p>
              </div>
            )}
            {user?.is_verified_seller && (
              <div className={styles.infoGroup}>
                <label>{t('settings.seller_type_label')}</label>
                <p>{user?.seller_type || t('settings.na_label')}</p>
              </div>
            )}
            {!user?.is_verified_seller && user?.role !== 'seller' && user?.role !== 'admin' && !sellerStatusLoading && !sellerStatus?.has_application && (
              <div className={styles.infoGroup}>
                <button className={styles.settingsBtn} onClick={() => navigate('/settings/become-seller')}>
                  {t('settings.become_seller_button')}
                </button>
              </div>
            )}
            {!user?.is_verified_seller && user?.role !== 'seller' && user?.role !== 'admin' && sellerStatus?.has_application && (
              <div className={styles.infoGroup}>
                {sellerStatus.status === 'rejected' ? (
                  <>
                    <p className={styles.statusWarning}>{t('settings.application_rejected_text')}</p>
                    {sellerStatus.rejection_reason && (
                      <p className={styles.statusMuted}>{sellerStatus.rejection_reason}</p>
                    )}
                    <div className={styles.accountActions}>
                      <button className={styles.settingsBtn} onClick={() => navigate('/settings/become-seller')}>
                        {t('settings.resubmit_application_button')}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className={styles.statusMuted}>
                    {sellerStatus.status === 'pending' || sellerStatus.status === 'under_review' || sellerStatus.status === 'revision_requested'
                      ? t('settings.application_submitted_wait')
                      : null}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'security':
        return renderSecurityTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'legal':
        return renderLegalTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'account':
      default:
        return renderAccountTab();
    }
  };

  return (
    <Layout>
      <div className={styles.settingsPage}>
        <section className={styles.settingsHeader}>
          <div className={styles.settingsHeaderContent}>
            <span className={styles.settingsEyebrow}>{t('settings.header_eyebrow')}</span>
            <h2>{t('settings.title')}</h2>
            <p>{t('settings.header_description')}</p>
            <div className={styles.settingsStats}>
              <div className={styles.settingsStat}>
                <span>{t('settings.stat_membership_label')}</span>
                <strong>
                  {user?.role === 'admin'
                    ? t('settings.stat_membership_admin')
                    : user?.role === 'seller'
                      ? t('settings.stat_membership_seller')
                      : t('settings.stat_membership_user')}
                </strong>
              </div>
              <div className={styles.settingsStat}>
                <span>{t('settings.stat_language_label')}</span>
                <strong>{currentLanguage.toUpperCase()}</strong>
              </div>
              <div className={styles.settingsStat}>
                <span>{t('settings.stat_security_label')}</span>
                <strong>
                  {user?.is_two_factor_enabled ? t('settings.stat_security_2fa_active') : t('settings.stat_security_2fa_pending')}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.settingsTabs} role="tablist" aria-label="Account settings sections">
          {(
            [
              { key: 'account', label: t('settings.account_tab') },
              { key: 'security', label: t('settings.security_tab') },
              { key: 'privacy', label: t('settings.privacy_tab') },
              { key: 'legal', label: t('settings.legal_tab') },
              { key: 'preferences', label: t('settings.preferences_tab') },
            ] as Array<{ key: SettingsTab; label: string }>
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              className={cx(styles.tabButton, activeTab === key && styles.tabButtonActive)}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.settingsSections}>{renderContent()}</div>
      </div>
      {!user?.is_oauth_only_user && (
        <ChangePasswordModal
          isOpen={showChangePw}
          userEmail={user?.email}
          userId={user?.id ?? null}
          onClose={() => setShowChangePw(false)}
        />
      )}
    </Layout>
  );
};

export default Settings;
