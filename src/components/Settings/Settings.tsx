import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import TwoFactorAuth from '../Settings/TwoFactorAuth';
import PasswordSetup from '../Settings/PasswordSetup';
import './Settings.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { user, changeLanguage: changeUserLanguage } = useAuth();
  const { language, changeLanguage: changeLocalLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('account');
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'security':
        return (
          <>
            <div className="settings-card">
              <h3>Account Privacy</h3>
              <div className="privacy-option">
                <div>
                  <strong>Private Account</strong>
                  <p>When your account is private, only people you approve can see your projects and collections.</p>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
            <div className="settings-card">
              <h3>Two-Factor Authentication</h3>
              <p className="card-description">Add an extra layer of security to your account.</p>
              <TwoFactorAuth />
            </div>
            <div className="settings-card">
              <h3>Password</h3>
              <p className="card-description">
                {user?.is_oauth_only_user
                  ? 'Set up a password for additional login options.'
                  : 'Manage your account password.'
                }
              </p>
              {user?.is_oauth_only_user ? (
                <PasswordSetup />
              ) : (
                <button className="btn btn-secondary">Change Password</button>
              )}
            </div>
          </>
        );
    case 'preferences':
        const handleLanguageChange = async (languageCode: string) => {
            try {
                if (languageCode === 'en' || languageCode === 'pt') {
                    // Use backend API for PT and EN (saves to database)
                    await changeUserLanguage(languageCode);
                    console.log(`Language changed to ${languageCode} (saved to backend)`);
                } else {
                    // Use local language context for other languages (frontend only)
                    changeLocalLanguage(languageCode);
                    console.log(`Language changed to ${languageCode} (local only)`);
                }
            } catch (error) {
                console.error('Failed to change language:', error);
            }
        };

        // Get current language - prioritize user's backend language, fallback to local language
        const currentLanguage = user?.language || language;

        return (
            <div className="settings-card">
                <h3>Language Preferences</h3>
                <p className="card-description">Choose your preferred language for the interface.</p>
                <div className="language-selector">
                    <button 
                        onClick={() => handleLanguageChange('en')} 
                        className={`btn ${currentLanguage === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => handleLanguageChange('pt')} 
                        className={`btn ${currentLanguage === 'pt' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Português
                    </button>
                    <button 
                        onClick={() => handleLanguageChange('fr')} 
                        className={`btn ${currentLanguage === 'fr' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Français
                    </button>
                    <button 
                        onClick={() => handleLanguageChange('de')} 
                        className={`btn ${currentLanguage === 'de' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Deutsch
                    </button>
                    <button 
                        onClick={() => handleLanguageChange('es')} 
                        className={`btn ${currentLanguage === 'es' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Español
                    </button>
                </div>
                <div className="current-language-info">
                    <small>
                        Current language: {
                            currentLanguage === 'pt' ? 'Portuguese' :
                            currentLanguage === 'fr' ? 'French' :
                            currentLanguage === 'de' ? 'German' :
                            currentLanguage === 'es' ? 'Spanish' :
                            'English'
                        }
                        {(user?.language === 'en' || user?.language === 'pt') && ' (saved to account)'}
                    </small>
                </div>
            </div>
        );
      case 'account':
      default:
        return (
          <>
            <div className="settings-card">
              <h3>Account Information</h3>
              <div className="account-info">
                <div className="info-group">
                  <label>Username</label>
                  <p>{user?.username}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="info-group">
                  <label>Name</label>
                  <p>{user?.first_name} {user?.last_name}</p>
                </div>
                <div className="info-group">
                  <label>Account Type</label>
                  <p className={user?.is_oauth_only_user ? 'oauth-only' : 'full-account'}>
                    {user?.is_oauth_only_user ? 'Google OAuth Only' : 'Full Account'}
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/profile/edit')}>
                Edit Profile
              </button>
            </div>
            <div className="settings-card">
              <h3>Seller Status</h3>
              <div className="account-info">
                <div className="info-group">
                  <label>Verification</label>
                  <p className={user?.is_verified_seller ? 'verified' : 'unverified'}>
                    {user?.is_verified_seller ? 'Verified Seller' : 'Not a Verified Seller'}
                  </p>
                </div>
                {user?.is_verified_seller && (
                  <div className="info-group">
                    <label>Seller Type</label>
                    <p>{user?.seller_type || 'N/A'}</p>
                  </div>
                )}
              </div>
              {!user?.is_verified_seller && (
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/settings/become-seller')}>
                  Become a Verified Seller
                </button>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-header">
          <h2>{t('settings.title')}</h2>
        </div>
        <div className="settings-tabs">
          <button onClick={() => setActiveTab('account')} className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}>{t('settings.account_tab')}</button>
          <button onClick={() => setActiveTab('security')} className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}>{t('settings.security_tab')}</button>
          <button className="tab-button" disabled>{t('settings.notifications_tab')}</button>
          <button onClick={() => setActiveTab('preferences')} className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}>{t('settings.preferences_tab')}</button>
        </div>
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
