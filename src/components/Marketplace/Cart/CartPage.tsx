import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useCart } from '../../../contexts/CartContext';
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
      <div className="cart-page">
        <div className="page-header">
          <h2 className="page-title">
            {t('cart.title')} ({activeItemsCount})
            {inactiveItemsCount > 0 && (
              <span className="inactive-count"> + {inactiveItemsCount} {t('cart.inactive_items')}</span>
            )}
          </h2>
          {error && (
            <StockWarning 
              message={error} 
              type="error" 
              onClose={clearError} 
            />
          )}
        </div>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart-message">
            <h3>{t('cart.empty_cart')}</h3>
            <p>{t('cart.empty_cart_prompt')}</p>
            <Link to="/" className="btn btn-primary btn-lg">{t('cart.continue_shopping')}</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.id} className={`cart-item-card ${!item.isActive ? 'inactive-item' : ''}`}>
                  <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="product-image" />
                  <div className="item-details">
                    <Link to={`/products/${item.slug}`} className="product-name">{item.name}</Link>
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
                              {t('cart.available_stock', { count: item.availableStock })}
                            </p>
                            <p className="adjustment-hint">
                              {adjustingItems.has(item.id) ? 
                                'Updating quantity...' : 
                                `Click ✕ above to adjust quantity to ${item.availableStock} ${item.availableStock === 1 ? 'item' : 'items'}`
                              }
                            </p>
                          </div>
                        )}
                        {item.availableStock === 0 && (
                          <div className="stock-adjustment-info">
                            <p className="no-stock-info">
                              This item is out of stock.
                            </p>
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
                    <button onClick={() => removeFromCart(item.id)} className="remove-btn">{t('cart.remove')}</button>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-control">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        disabled={item.quantity <= 1 || !item.isActive}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        disabled={!item.isActive}
                      >
                        +
                      </button>
                    </div>
                    <p className="item-total-price">${((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                  {!item.isActive && (
                    <div className="inactive-overlay">
                      <span className="inactive-label">{t('cart.item_unavailable')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="order-summary-card">
              <h3>{t('checkout.order_summary_title')}</h3>
              <div className="summary-row">
                <span>{t('checkout.subtotal_label')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>{t('checkout.shipping_label')}</span>
                <span>{t('checkout.shipping_calculated_text')}</span>
              </div>
              <div className="summary-total">
                <span>{t('checkout.total_label')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="btn btn-primary btn-block">{t('cart.checkout_button')}</Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
