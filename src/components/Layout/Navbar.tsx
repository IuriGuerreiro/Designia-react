import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './Navbar.css';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Designia</Link>
        <div className="navbar-links">
          <NavLink to="/products" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('layout.products')}</NavLink>
          <NavLink to="/social-media" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('layout.social_media')}</NavLink>
        </div>
        <div className="navbar-actions">
          <Link to="/cart" className="nav-link cart-link">
            <span className="cart-icon">🛒</span>
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          </Link>
          <div className="navbar-user-menu" ref={dropdownRef}>
            <button className="user-menu-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="user-avatar">{user?.first_name?.charAt(0) || user?.username?.charAt(0)}</div>
              <span>{user?.first_name || user?.username}</span>
              <span className={`dropdown-caret ${dropdownOpen ? 'open' : ''}`}>▼</span>
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/my-products" className="dropdown-item" onClick={() => setDropdownOpen(false)}>{t('layout.my_products')}</Link>
                <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>{t('layout.orders')}</Link>
                <Link to="/order-management" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Order Management</Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>{t('layout.settings')}</Link>
                <button onClick={logout} className="dropdown-item logout">{t('layout.logout')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;