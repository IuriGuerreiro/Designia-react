import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TwoFactorAuth from './TwoFactorAuth';
import PasswordSetup from './PasswordSetup';
import './Settings.css';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('account');

  const renderContent = () => {
    switch (activeTab) {
      case 'security':
        return (
          <>
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
      case 'account':
      default:
        return (
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
          </div>
        );
    }
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-layout">
        <nav className="settings-nav">
          <button onClick={() => setActiveTab('account')} className={activeTab === 'account' ? 'active' : ''}>Account</button>
          <button onClick={() => setActiveTab('security')} className={activeTab === 'security' ? 'active' : ''}>Security</button>
          <button disabled>Notifications</button>
          <button disabled>Preferences</button>
        </nav>
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
