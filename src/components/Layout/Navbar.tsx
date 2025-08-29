import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActivityContext } from '../../contexts/ActivityContext';
import { useTranslation } from 'react-i18next';
import styles from './Navbar.module.css';

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { cartCount, unreadMessagesCount } = useActivityContext();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const userInitial = user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U';

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className={styles.logo}>Designia</Link>
          <div className={styles.navLinks}>
            <NavLink to="/products" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              {t('layout.products')}
            </NavLink>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/cart" className={styles.actionBtn}>
            <CartIcon />
            {cartCount > 0 && <div className={styles.cartBadge}>{cartCount}</div>}
          </Link>

          <Link to="/chat" className={styles.actionBtn}>
            <ChatIcon />
            {unreadMessagesCount > 0 && <div className={styles.cartBadge}>{unreadMessagesCount}</div>}
          </Link>

          <div className={styles.userMenu} ref={dropdownRef}>
            <button className={styles.userAvatar} onClick={() => setDropdownOpen(!dropdownOpen)}>
              {userInitial}
            </button>
            
            {dropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropdownUserName}>{user?.first_name || user?.username}</p>
                  <p className={styles.dropdownUserEmail}>{user?.email}</p>
                </div>
                <div className={styles.dropdownBody}>
                  <Link to="/my-products" className={styles.dropdownLink}>{t('layout.my_products')}</Link>
                  <Link to="/my-orders" className={styles.dropdownLink}>My Orders</Link>
                  <Link to="/order-management" className={styles.dropdownLink}>Seller Orders</Link>
                  <Link to="/payouts" className={styles.dropdownLink}>Payouts</Link>
                  <Link to="/settings" className={styles.dropdownLink}>{t('layout.settings')}</Link>
                </div>
                <div className={styles.dropdownFooter}>
                  <button onClick={logout} className={`${styles.dropdownLink} ${styles.logoutBtn}`}>
                    {t('layout.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
