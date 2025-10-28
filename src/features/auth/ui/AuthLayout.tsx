import React from 'react';
import { useTheme } from '@/shared/state/ThemeContext';
import styles from './Auth.module.css';

const highlights = [
  {
    icon: '🎯',
    title: 'Tailored moodboards',
    description: 'Start from curated palettes that match your style and budget.'
  },
  {
    icon: '🤝',
    title: 'Live designer sessions',
    description: 'Collaborate with verified experts in real time and stay aligned at every step.'
  },
  {
    icon: '🪄',
    title: 'AR spatial previews',
    description: 'Drop 3D models into your room and iterate instantly before you buy.'
  }
];

const stats = [
  { value: '120K+', label: 'rooms styled' },
  { value: '250+', label: 'design partners' },
  { value: '4.9★', label: 'client rating' }
];

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tokens } = useTheme();

  return (
    <div
      className={styles['auth-screen']}
      style={{ backgroundImage: tokens.canvasGradient, backgroundColor: tokens.background }}
    >
      <div className={styles['auth-content-wrapper']}>
        <aside
          className={styles['auth-branding']}
          style={{ backgroundImage: tokens.heroGradient, backgroundColor: tokens.accentStrong }}
        >
          <div className={styles['auth-branding-sheen']} />
          <div className={styles['auth-branding-content']}>
            <div className={styles['auth-logo']}>Designia</div>
            <h1 className={styles['auth-hero-title']}>Design smarter. Live better.</h1>
            <p className={styles['auth-hero-subtitle']}>
              Build immersive interiors, sync with designers, and preview every finish before it ships.
            </p>

            <ul className={styles['auth-features']}>
              {highlights.map((item) => (
                <li key={item.title}>
                  <span className={styles['feature-icon']}>{item.icon}</span>
                  <div>
                    <span className={styles['feature-title']}>{item.title}</span>
                    <p className={styles['feature-description']}>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles['auth-branding-footer']}>
            <div className={styles['auth-stats']}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles['auth-stat-card']}>
                  <span className={styles['auth-stat-value']}>{stat.value}</span>
                  <span className={styles['auth-stat-label']}>{stat.label}</span>
                </div>
              ))}
            </div>
            <div className={styles['trust-indicators']}>
              <span className={styles['trust-badge']}>🔒 Secure payments</span>
              <span className={styles['trust-badge']}>🌍 Global shipping</span>
              <span className={styles['trust-badge']}>⚡ Instant previews</span>
            </div>
          </div>
        </aside>

        <section className={styles['auth-form-section']}>
          <div className={styles['auth-container']}>
            {children}
            <p className={styles['auth-support']}>Need a hand? <span>Our concierge team is available 24/7.</span></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;
