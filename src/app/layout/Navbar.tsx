import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/state/AuthContext';
import { useActivityContext } from '../../shared/state/ActivityContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/state/ThemeContext';
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

const AdminIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const CubeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
    <path d="M12 22V12" />
    <path d="M12 12L2 7" />
    <path d="M12 12l10-5" />
  </svg>
);

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout, isAdmin, isSeller, canSellProducts } = useAuth();
  const { cartCount, unreadMessagesCount } = useActivityContext();
  const location = useLocation();
  const { mode, toggleMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setAdminDropdownOpen(false);
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

            {isAdmin() && (
              <div className={styles.adminNavMenu} ref={adminDropdownRef}>
                <button
                  className={styles.adminNavLink}
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                >
                  Admin
                </button>

                {adminDropdownOpen && (
                  <div className={styles.adminNavDropdown}>
                    <Link to="/admin/seller-applications" className={styles.adminNavDropdownLink}>
                      Seller Applications
                    </Link>
                    <Link to="/admin/payouts" className={styles.adminNavDropdownLink}>
                      All Payouts
                    </Link>
                    <Link to="/admin/transactions" className={styles.adminNavDropdownLink}>
                      All Transactions
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleMode}
            aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} theme`}
            title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {mode === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
          <div className={styles.roleDisplay}>
            Role: {user?.role || 'user'}
          </div>

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
                  {/* Seller/Admin only features */}
                  {canSellProducts() && (
                    <>
                      <Link to="/my-products" className={styles.dropdownLink}>{t('layout.my_products')}</Link>
                      <Link to="/order-management" className={styles.dropdownLink}>Seller Orders</Link>
                      <Link to="/payouts" className={styles.dropdownLink}>Payouts</Link>
                    </>
                  )}

                  {/* User only feature - Apply to become seller */}
                  {!canSellProducts() && (
                    <Link to="/settings/become-seller" className={styles.dropdownLink}>Become a Seller</Link>
                  )}

                  {/* Everyone can access these */}
                  <Link to="/favorites" className={styles.dropdownLink}>{t('layout.my_favorites')}</Link>
                  <Link to="/my-orders" className={styles.dropdownLink}>My Orders</Link>
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
