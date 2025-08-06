import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const Sidebar = () => (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">Designia</h1>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
        <Link to="/products" className={location.pathname.startsWith('/products') ? 'active' : ''}>Products</Link>
        <Link to="/messages" className={location.pathname === '/messages' ? 'active' : ''}>Messages</Link>
        <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>Settings</Link>
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

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Dashboard;