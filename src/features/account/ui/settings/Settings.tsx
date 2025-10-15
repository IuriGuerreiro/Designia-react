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
      <div className={styles['settings-card']}>
        <h3>Two-Factor Authentication</h3>
        <p className={styles['card-description']}>
          Add an extra layer of security to your account.
        </p>
        <TwoFactorAuth />
      </div>
      <div className={styles['settings-card']}>
        <h3>Password</h3>
        <p className={styles['card-description']}>
          {user?.is_oauth_only_user
            ? 'Set up a password for additional login options.'
            : 'Manage your account password.'}
        </p>
        {user?.is_oauth_only_user ? (
          <PasswordSetup />
        ) : (
          <button className={cx(styles['account-btn'], styles['account-btn-secondary'])}>
            Change Password
          </button>
        )}
      </div>
      <div className={styles['settings-card']}>
        <h3>Account Management</h3>
        <p className={styles['card-description']}>
          Manage your account settings and profile.
        </p>
        <div className={styles.accountActions}>
          <button
            className={cx(styles['account-btn'], styles['account-btn-secondary'])}
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </button>
          {!user?.is_verified_seller && user?.role !== 'seller' && user?.role !== 'admin' && (
            <button
              className={cx(styles['account-btn'], styles['account-btn-primary'])}
              onClick={() => navigate('/settings/become-seller')}
            >
              Become a Seller
            </button>
          )}
        </div>
      </div>
    </>
  );

  const renderPrivacyTab = () => (
    <div className={styles['settings-card']}>
      <h3>Account Privacy</h3>
      <div className={styles['privacy-option']}>
        <div>
          <strong>Private Account</strong>
          <p>
            When your account is private, only people you approve can see your projects and collections.
          </p>
        </div>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
          />
          <span className={styles.slider}></span>
        </label>
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
    <div className={styles['settings-card']}>
      <h3>Language Preferences</h3>
      <p className={styles['card-description']}>
        Choose your preferred language for the interface.
      </p>
      <div className={styles['language-selector']}>
        {languageButtons.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={cx(
              styles['settings-btn'],
              currentLanguage === code
                ? styles['settings-btn-primary']
                : styles['settings-btn-secondary'],
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles['current-language-info']}>
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
      <div className={styles['settings-card']}>
        <h3>Privacy Policy</h3>
        <p className={styles['card-description']}>
          Read our privacy policy to understand how we collect, use, and protect your information.
        </p>
        <button
          className={cx(styles['account-btn'], styles['account-btn-secondary'])}
          onClick={() => window.open('/privacy-policy', '_blank')}
        >
          View Privacy Policy
        </button>
      </div>
      <div className={styles['settings-card']}>
        <h3>Terms of Use</h3>
        <p className={styles['card-description']}>
          Review our terms of service and user agreement.
        </p>
        <button
          className={cx(styles['account-btn'], styles['account-btn-secondary'])}
          onClick={() => window.open('/terms-of-use', '_blank')}
        >
          View Terms of Use
        </button>
      </div>
    </>
  );

  const renderAccountTab = () => (
    <>
      <div className={styles['settings-card']}>
        <h3>Account Information</h3>
        <div className={styles['account-info']}>
          <div className={styles['info-group']}>
            <label>Username</label>
            <p>{user?.username}</p>
          </div>
          <div className={styles['info-group']}>
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
          <div className={styles['info-group']}>
            <label>Name</label>
            <p>
              {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div className={styles['info-group']}>
            <label>Account Type</label>
            <p className={user?.is_oauth_only_user ? styles['oauth-only'] : styles['full-account']}>
              {user?.is_oauth_only_user ? 'Google OAuth Only' : 'Full Account'}
            </p>
          </div>
        </div>
      </div>
      <div className={styles['settings-card']}>
        <h3>Seller Status</h3>
        <div className={styles['account-info']}>
          <div className={styles['info-group']}>
            <label>Verification</label>
            <p className={user?.is_verified_seller ? styles.verified : styles.unverified}>
              {user?.is_verified_seller ? 'Verified Seller' : 'Not a Verified Seller'}
            </p>
          </div>
          {user?.is_verified_seller && (
            <div className={styles['info-group']}>
              <label>Seller Type</label>
              <p>{user?.seller_type || 'N/A'}</p>
            </div>
          )}
          {!user?.is_verified_seller && user?.role !== 'seller' && user?.role !== 'admin' && (
            <div className={styles['info-group']}>
              <button
                className={cx(styles['account-btn'], styles['account-btn-primary'])}
                onClick={() => navigate('/settings/become-seller')}
              >
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
      <div className={styles['settings-page']}>
        <div className={styles['settings-header']}>
          <h2>{t('settings.title')}</h2>
        </div>
        <div className={styles['settings-tabs']}>
          <button
            onClick={() => setActiveTab('account')}
            className={cx(
              styles['tab-button'],
              activeTab === 'account' && styles['tab-button-active'],
            )}
          >
            {t('settings.account_tab')}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={cx(
              styles['tab-button'],
              activeTab === 'security' && styles['tab-button-active'],
            )}
          >
            {t('settings.security_tab')}
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={cx(
              styles['tab-button'],
              activeTab === 'privacy' && styles['tab-button-active'],
            )}
          >
            {t('settings.privacy_tab')}
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={cx(
              styles['tab-button'],
              activeTab === 'legal' && styles['tab-button-active'],
            )}
          >
            {t('settings.legal_tab')}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={cx(
              styles['tab-button'],
              activeTab === 'preferences' && styles['tab-button-active'],
            )}
          >
            {t('settings.preferences_tab')}
          </button>
        </div>
        <div className={styles['settings-content']}>{renderContent()}</div>
      </div>
    </Layout>
  );
};

export default Settings;
