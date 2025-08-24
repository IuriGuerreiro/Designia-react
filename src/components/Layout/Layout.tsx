import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showBackToTop?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'default' | 'minimal';
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className = '',
  showBackToTop = true,
  maxWidth = 'xl',
  padding = 'default'
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const maxWidthClasses = {
    sm: styles.maxWidthSm,
    md: styles.maxWidthMd, 
    lg: styles.maxWidthLg,
    xl: styles.maxWidthXl,
    full: styles.maxWidthFull
  };

  const paddingClasses = {
    default: styles.paddingDefault,
    minimal: styles.paddingMinimal
  };

  return (
    <div className={`${styles.layout} ${className}`}>
      <Navbar />
      
      <main className={styles.mainContent}>
        <div className={`${styles.container} ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]}`}>
          {children}
        </div>
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={`${styles.footerSection} ${styles.footerBrand}`}>
            <div className={styles.footerLogo}>
              <span className={styles.footerBrandName}>Designia</span>
            </div>
            <p className={styles.footerDescription}>
              Transform your space with premium furniture pieces visualized through cutting-edge AR technology.
            </p>
          </div>
          
          <div className={`${styles.footerSection} ${styles.footerLinks}`}>
            <h4>Marketplace</h4>
            <ul>
              <li><a href="/products">Browse Products</a></li>
              <li><a href="/categories">Categories</a></li>
              <li><a href="/designers">Featured Designers</a></li>
              <li><a href="/ar-experience">AR Experience</a></li>
            </ul>
          </div>
          
          <div className={`${styles.footerSection} ${styles.footerLinks}`}>
            <h4>Support</h4>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/shipping">Shipping Info</a></li>
              <li><a href="/returns">Returns</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Connect</h4>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20-2 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
            <h5>Stay Updated</h5>
            <div className={styles.newsletterForm}>
              <input type="email" placeholder="Enter your email" className={styles.newsletterInput} />
              <button className={styles.newsletterBtn} aria-label="Subscribe to newsletter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContent}>
            <div className={styles.footerCopyright}>
              <p>&copy; 2024 Designia. All rights reserved.</p>
            </div>
            <div className={styles.footerLegal}>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      
      {showBackToTop && showScrollTop && (
        <button 
          className={styles.backToTopBtn}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Layout;
