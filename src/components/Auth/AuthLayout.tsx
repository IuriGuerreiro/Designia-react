import React from 'react';
import styles from './Auth.module.css';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles['auth-screen']}>
      <div className={styles['auth-content-wrapper']}>
        <div className={styles['auth-branding']}>
          <div className={styles['auth-branding-content']}>
            <div className={styles['auth-logo']}>Designia</div>
            <h1 className={styles['auth-hero-title']}>Your space, reimagined.</h1>
            <p className={styles['auth-hero-subtitle']}>
              Discover unique furniture, connect with designers, and bring your dream home to life with cutting-edge AR technology.
            </p>
            <ul className={styles['auth-features']}>
              <li>
                <span className={styles['feature-icon']}>✨</span>
                <span>Discover unique furniture pieces</span>
              </li>
              <li>
                <span className={styles['feature-icon']}>🎨</span>
                <span>Connect with talented designers</span>
              </li>
              <li>
                <span className={styles['feature-icon']}>📱</span>
                <span>Visualize items in your space with AR</span>
              </li>
              <li>
                <span className={styles['feature-icon']}>🛍️</span>
                <span>Shop curated premium collections</span>
              </li>
            </ul>
            <div className={styles['auth-branding-footer']}>
              <div className={styles['trust-indicators']}>
                <span className={styles['trust-badge']}>🔒 Secure</span>
                <span className={styles['trust-badge']}>⭐ Premium</span>
                <span className={styles['trust-badge']}>🚀 AR-Powered</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles['auth-form-section']}>
          <div className={styles['auth-container']}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
