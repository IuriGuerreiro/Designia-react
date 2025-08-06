import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../Layout/Layout';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h2>Welcome, {user?.first_name || user?.username}!</h2>
          <p>This is your dashboard. Here you'll find an overview of your activity.</p>
        </div>
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
    </Layout>
  );
};

export default DashboardPage;
