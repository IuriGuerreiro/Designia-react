import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/app/layout';
import { useAuth } from '@/features/auth/state/AuthContext';
import { useLanguage } from '@/shared/state/LanguageContext';
import TwoFactorAuth from '../security/TwoFactorAuth';
import PasswordSetup from '../security/PasswordSetup';
import styles from './Settings.module.css';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

type SettingsTab = 'account' | 'security' | 'privacy' | 'legal' | 'preferences';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { user, changeLanguage: changeUserLanguage } = useAuth();
  const { language, changeLanguage: changeLocalLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      if (languageCode === 'en' || languageCode === 'pt') {
        await changeUserLanguage(languageCode);
      } else {
        changeLocalLanguage(languageCode);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const currentLanguage = user?.language || language;

  const renderSecurityTab = () => (
    <>
      <div className={styles.settingsCard}>
        <h3>Two-Factor Authentication</h3>
        <p className={styles.cardDescription}>
          Add an extra layer of security to your account.
        </p>
        <TwoFactorAuth />
      </div>
      <div className={styles.settingsCard}>
        <h3>Password</h3>
        <p className={styles.cardDescription}>
          {user?.is_oauth_only_user
            ? 'Set up a password for additional login options.'
            : 'Manage your account password.'}
        </p>
        {user?.is_oauth_only_user ? (
          <PasswordSetup />
        ) : (
          <button className={cx(styles.settingsBtn, styles.settingsBtnSecondary)}>
            Change Password
          </button>
        )}
      </div>
      <div className={styles.settingsCard}>
        <h3>Account Management</h3>
        <p className={styles.cardDescription}>
          Manage your account settings and profile.
        </p>
        <div className={styles.accountActions}>
          <button
            className={cx(styles.settingsBtn, styles.settingsBtnSecondary)}
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </button>
          {!user?.is_verified_seller && user?.role !== 'seller' && user?.role !== 'admin' && (
            <button className={styles.settingsBtn} onClick={() => navigate('/settings/become-seller')}>
              Become a Seller
            </button>
          )}
      </div>
    </div>
  </>
);

const renderPrivacyTab = () => (
  <div className={styles.settingsCard}>
    <h3>Account Privacy</h3>
    <div className={styles.privacyOption}>
      <div>
        <strong>Private Account</strong>
        <p>
          When your account is private, only people you approve can see your projects and collections.
        </p>
      </div>
      <div className={styles.toggleField}>
        <input
          id="settings-private-toggle"
          type="checkbox"
          checked={isPrivate}
          onChange={() => setIsPrivate((prev) => !prev)}
        />
        <label htmlFor="settings-private-toggle">
          {isPrivate ? 'Private mode enabled' : 'Currently public'}
        </label>
      </div>
    </div>
  </div>
);

  const languageButtons = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
  ];

  const renderPreferencesTab = () => (
    <div className={styles.settingsCard}>
      <h3>Language Preferences</h3>
      <p className={styles.cardDescription}>
        Choose your preferred language for the interface.
      </p>
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
          Current language:{' '}
          {currentLanguage === 'pt'
            ? 'Portuguese'
            : currentLanguage === 'fr'
              ? 'French'
              : currentLanguage === 'de'
                ? 'German'
                : currentLanguage === 'es'
                  ? 'Spanish'
                  : 'English'}
          {(user?.language === 'en' || user?.language === 'pt') && ' (saved to account)'}
        </small>
      </div>
    </div>
  );

  const renderLegalTab = () => (
    <>
      <div className={styles.settingsCard}>
        <h3>Privacy Policy</h3>
        <p className={styles.cardDescription}>
          Read our privacy policy to understand how we collect, use, and protect your information.
        </p>
        <button
          className={cx(styles.settingsBtn, styles.settingsBtnSecondary)}
          onClick={() => window.open('/privacy-policy', '_blank')}
        >
          View Privacy Policy
        </button>
      </div>
      <div className={styles.settingsCard}>
        <h3>Terms of Use</h3>
        <p className={styles.cardDescription}>
          Review our terms of service and user agreement.
        </p>
        <button
          className={cx(styles.settingsBtn, styles.settingsBtnSecondary)}
          onClick={() => window.open('/terms-of-use', '_blank')}
        >
          View Terms of Use
        </button>
      </div>
    </>
  );

  const renderAccountTab = () => (
    <>
      <div className={styles.settingsCard}>
        <h3>Account Information</h3>
        <div className={styles.accountInfo}>
          <div className={styles.infoGroup}>
            <label>Username</label>
            <p>{user?.username}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
          <div className={styles.infoGroup}>
            <label>Name</label>
            <p>
              {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div className={styles.infoGroup}>
            <label>Account Type</label>
            <p className={user?.is_oauth_only_user ? styles.statusWarning : styles.statusSuccess}>
              {user?.is_oauth_only_user ? 'Google OAuth Only' : 'Full Account'}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.settingsCard}>
        <h3>Seller Status</h3>
        <div className={styles.accountInfo}>
          <div className={styles.infoGroup}>
            <label>Verification</label>
            <p className={user?.is_verified_seller ? styles.statusSuccess : styles.statusMuted}>
              {user?.is_verified_seller ? 'Verified Seller' : 'Not a Verified Seller'}
            </p>
          </div>
          {user?.is_verified_seller && (
            <div className={styles.infoGroup}>
              <label>Seller Type</label>
              <p>{user?.seller_type || 'N/A'}</p>
            </div>
          )}
          {!user?.is_verified_seller && user?.role !== 'seller' && user?.role !== 'admin' && (
            <div className={styles.infoGroup}>
              <button className={styles.settingsBtn} onClick={() => navigate('/settings/become-seller')}>
                Become a Seller
              </button>
            </div>
          )}
        </div>
      </div>
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
            <span className={styles.settingsEyebrow}>Account Center</span>
            <h2>{t('settings.title')}</h2>
            <p>
              Curate your identity, adjust privacy, and tailor Designia to your workflow. All preferences respect the
              monochrome theme and sync instantly across devices.
            </p>
            <div className={styles.settingsStats}>
              <div className={styles.settingsStat}>
                <span>Membership</span>
                <strong>{user?.role === 'admin' ? 'Admin Suite' : user?.role === 'seller' ? 'Seller Hub' : 'Collector'}</strong>
              </div>
              <div className={styles.settingsStat}>
                <span>Language</span>
                <strong>{currentLanguage.toUpperCase()}</strong>
              </div>
              <div className={styles.settingsStat}>
                <span>Security</span>
                <strong>{user?.is_two_factor_enabled ? '2FA Active' : '2FA Pending'}</strong>
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
    </Layout>
  );
};

export default Settings;
