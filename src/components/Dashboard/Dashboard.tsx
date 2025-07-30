import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Settings from '../Settings/Settings';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'marketplace' | 'messages'>('dashboard');

  const Sidebar = () => (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">Designia</h1>
      </div>
      <nav className="sidebar-nav">
        <button onClick={() => setCurrentView('dashboard')} className={currentView === 'dashboard' ? 'active' : ''}>Dashboard</button>
        <button onClick={() => setCurrentView('marketplace')} className={currentView === 'marketplace' ? 'active' : ''}>Marketplace</button>
        <button onClick={() => setCurrentView('messages')} className={currentView === 'messages' ? 'active' : ''}>Messages</button>
        <button onClick={() => setCurrentView('settings')} className={currentView === 'settings' ? 'active' : ''}>Settings</button>
      </nav>
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{user?.first_name?.charAt(0) || user?.username?.charAt(0)}</div>
          <div className="user-info">
            <span className="user-name">{user?.first_name || user?.username}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        <button onClick={logout} className="logout-button">Logout</button>
      </div>
    </aside>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'settings':
        return <Settings />;
      case 'marketplace':
        return (
          <div className="page-content">
            <h2>Marketplace</h2>
            <p>Browse furniture and designs. (Coming Soon)</p>
          </div>
        );
      case 'messages':
        return (
          <div className="page-content">
            <h2>Messages</h2>
            <p>Your conversations with designers and sellers. (Coming Soon)</p>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="page-content">
            <h2>Welcome, {user?.first_name || user?.username}!</h2>
            <p>This is your dashboard. Here you'll find an overview of your activity.</p>
            <div className="welcome-card">
              <h3>Your Stats</h3>
              <div className="user-details">
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>2FA Status:</strong> 
                  <span className={user?.two_factor_enabled ? 'status-enabled' : 'status-disabled'}>
                    {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
