import React from 'react';
import './Auth.css';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="auth-screen">
      <div className="auth-content-wrapper">
        <div className="auth-branding">
          <div className="auth-branding-content">
            <div className="auth-logo">Designia</div>
            <h1>Your space, reimagined.</h1>
            <p>Discover unique furniture, connect with designers, and bring your dream home to life.</p>
            <ul className="auth-features">
              <li>Discover unique furniture pieces</li>
              <li>Connect with designers</li>
              <li>Visualize items in your space</li>
              <li>Shop curated collections</li>
            </ul>
          </div>
        </div>
        <div className="auth-form-section">
          <div className="auth-container">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
