import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useCart } from '../../../shared/state/CartContext';
import { useTranslation } from 'react-i18next';
import StockWarning from '../../Common/StockWarning';
import './Cart.css';

const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, error, clearError, clearItemError } = useCart();
  const [adjustingItems, setAdjustingItems] = useState<Set<string | number>>(new Set());

  const handleClearItemError = async (itemId: string | number) => {
    setAdjustingItems(prev => new Set(prev).add(itemId));
    try {
      await clearItemError(itemId);
      // Success feedback could be added here
    } catch (error) {
      console.error('Failed to adjust item:', error);
    } finally {
      setAdjustingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    // Only include active items in subtotal calculation
    if (item.isActive === false) return sum;
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);

  const activeItemsCount = cartItems.filter(item => item.isActive !== false).length;
  const inactiveItemsCount = cartItems.filter(item => item.isActive === false).length;

  return (
    <Layout>
      <div className="cart-container">
        {/* Header Section - Premium Design System */}
        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
            {inactiveItemsCount > 0 && (
              <span className="inactive-count"> + {inactiveItemsCount} unavailable</span>
            )}
          </p>
          {error && (
            <div className="cart-error">
              <StockWarning 
                message={error} 
                type="error" 
                onClose={clearError} 
              />
            </div>
          )}
        </div>
        
        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-icon">🛒</div>
            <h3 className="empty-title">Your Cart is Empty</h3>
            <p className="empty-description">
              Looks like you haven't added any furniture to your cart yet. Start shopping to discover amazing pieces!
            </p>
            <Link to="/" className="start-shopping-btn">
              🛍️ Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items Section */}
            <div className="cart-items-section">
                              <div className="cart-items-header">
                  <h2 className="section-title">Cart Items</h2>
                  <span className="items-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
                </div>
              
              <div className="cart-items-list">
                {cartItems.map(item => (
                  <div key={item.id} className={`cart-item-card ${!item.isActive ? 'inactive-item' : ''}`}>
                    {/* Product Image */}
                    <div className="item-image-container">
                      <img 
                        src={item.image || '/placeholder-product.svg'} 
                        alt={item.name} 
                        className="item-image"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.svg';
                        }}
                      />
                      {!item.isActive && (
                        <div className="inactive-overlay">
                          <span className="inactive-label">Unavailable</span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="item-details">
                      <Link to={`/products/${item.slug}`} className="item-name">{item.name}</Link>
                      <p className="item-price">${(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toFixed(2)}</p>
                      
                      {item.stockError && (
                        <div className="item-stock-warning">
                          <StockWarning 
                            message={adjustingItems.has(item.id) ? 'Adjusting quantity...' : item.stockError} 
                            type="error" 
                            onClose={adjustingItems.has(item.id) ? undefined : () => handleClearItemError(item.id)}
                            compact={true}
                          />
                          {item.availableStock !== undefined && item.availableStock > 0 && (
                            <div className="stock-adjustment-info">
                              <p className="available-stock-info">
                                Available: {item.availableStock} {item.availableStock === 1 ? 'item' : 'items'}
                              </p>
                              <p className="adjustment-hint">
                                {adjustingItems.has(item.id) ? 
                                  'Updating quantity...' : 
                                  `Click ✕ above to adjust quantity to ${item.availableStock}`
                                }
                              </p>
                            </div>
                          )}
                          {item.availableStock === 0 && (
                            <div className="stock-adjustment-info">
                              <p className="no-stock-info">This item is out of stock.</p>
                              <p className="adjustment-hint">
                                {adjustingItems.has(item.id) ? 
                                  'Removing from cart...' : 
                                  'Click ✕ above to remove from cart'
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="item-quantity-section">
                      <div className="quantity-control">
                        <button 
                          className="quantity-btn minus"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          disabled={item.quantity <= 1 || !item.isActive}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          className="quantity-btn plus"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          disabled={!item.isActive}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Item Total & Actions */}
                    <div className="item-total-section">
                      <p className="item-total-price">${((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="remove-item-btn"
                        disabled={adjustingItems.has(item.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="order-summary-section">
              <div className="order-summary-card">
                <div className="summary-header">
                  <h3 className="summary-title">Order Summary</h3>
                </div>
                
                <div className="summary-content">
                  <div className="summary-row">
                    <span className="summary-label">Subtotal</span>
                    <span className="summary-value">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Shipping</span>
                    <span className="summary-value">Calculated at checkout</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <span className="total-label">Total</span>
                    <span className="total-amount">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="summary-actions">
                  <Link to="/checkout" className="checkout-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                    Proceed to Checkout
                  </Link>
                  <Link to="/" className="continue-shopping-btn">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
