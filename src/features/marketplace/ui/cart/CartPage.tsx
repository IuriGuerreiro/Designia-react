import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/app/layout';
import StockWarning from '@/components/Common/StockWarning';
import { useCart } from '@/shared/state/CartContext';
import styles from './Cart.module.css';

const CartPage: React.FC = () => {
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
      <div className={styles['cart-container']}>
        {/* Header Section - Premium Design System */}
        <div className={styles['cart-header']}>
          <h1 className={styles['cart-title']}>Shopping Cart</h1>
          <p className={styles['cart-subtitle']}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
            {inactiveItemsCount > 0 && (
              <span className={styles['inactive-count']}> + {inactiveItemsCount} unavailable</span>
            )}
          </p>
          {error && (
            <div className={styles['cart-error']}>
              <StockWarning 
                message={error} 
                type="error" 
                onClose={clearError} 
              />
            </div>
          )}
        </div>
        
        {cartItems.length === 0 ? (
          <div className={styles['cart-empty-state']}>
            <div className={styles['empty-icon']}>🛒</div>
            <h3 className={styles['empty-title']}>Your Cart is Empty</h3>
            <p className={styles['empty-description']}>
              Looks like you haven't added any furniture to your cart yet. Start shopping to discover amazing pieces!
            </p>
            <Link to="/" className={styles['start-shopping-btn']}>
              🛍️ Start Shopping
            </Link>
          </div>
        ) : (
          <div className={styles['cart-layout']}>
            {/* Cart Items Section */}
            <div className={styles['cart-items-section']}>
              <div className={styles['cart-items-header']}>
                <h2 className={styles['section-title']}>Cart Items</h2>
                <span className={styles['items-count']}>
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className={styles['cart-items-list']}>
                {cartItems.map(item => (
                  <div
                    key={item.id}
                    className={[styles['cart-item-card'], !item.isActive ? styles['inactive-item'] : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {/* Product Image */}
                    <div className={styles['item-image-container']}>
                      <img 
                        src={item.image || '/placeholder-product.svg'} 
                        alt={item.name} 
                        className={styles['item-image']}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.svg';
                        }}
                      />
                      {!item.isActive && (
                        <div className={styles['inactive-overlay']}>
                          <span className={styles['inactive-label']}>Unavailable</span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className={styles['item-details']}>
                      <Link to={`/products/${item.slug}`} className={styles['item-name']}>{item.name}</Link>
                      <p className={styles['item-price']}>${(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toFixed(2)}</p>
                      
                      {item.stockError && (
                        <div className={styles['item-stock-warning']}>
                          <StockWarning 
                            message={adjustingItems.has(item.id) ? 'Adjusting quantity...' : item.stockError} 
                            type="error" 
                            onClose={adjustingItems.has(item.id) ? undefined : () => handleClearItemError(item.id)}
                            compact={true}
                          />
                          {item.availableStock !== undefined && item.availableStock > 0 && (
                            <div className={styles['stock-adjustment-info']}>
                              <p className={styles['available-stock-info']}>
                                Available: {item.availableStock} {item.availableStock === 1 ? 'item' : 'items'}
                              </p>
                              <p className={styles['adjustment-hint']}>
                                {adjustingItems.has(item.id) ? 
                                  'Updating quantity...' : 
                                  `Click ✕ above to adjust quantity to ${item.availableStock}`
                                }
                              </p>
                            </div>
                          )}
                          {item.availableStock === 0 && (
                            <div className={styles['stock-adjustment-info']}>
                              <p className={styles['no-stock-info']}>This item is out of stock.</p>
                              <p className={styles['adjustment-hint']}>
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
                    <div className={styles['item-quantity-section']}>
                      <div className={styles['quantity-control']}>
                        <button
                          className={styles['quantity-btn']}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          disabled={item.quantity <= 1 || !item.isActive}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <span className={styles['quantity-display']}>{item.quantity}</span>
                        <button
                          className={styles['quantity-btn']}
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
                    <div className={styles['item-total-section']}>
                      <p className={styles['item-total-price']}>${((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className={styles['remove-item-btn']}
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
            <div className={styles['order-summary-section']}>
              <div className={styles['order-summary-card']}>
                <div className={styles['summary-header']}>
                  <h3 className={styles['summary-title']}>Order Summary</h3>
                </div>
                
                <div className={styles['summary-content']}>
                  <div className={styles['summary-row']}>
                    <span className={styles['summary-label']}>Subtotal</span>
                    <span className={styles['summary-value']}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className={styles['summary-row']}>
                    <span className={styles['summary-label']}>Shipping</span>
                    <span className={styles['summary-value']}>Calculated at checkout</span>
                  </div>
                  <div className={styles['summary-divider']}></div>
                  <div className={styles['summary-total']}>
                    <span className={styles['total-label']}>Total</span>
                    <span className={styles['total-amount']}>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className={styles['summary-actions']}>
                  <Link to="/checkout" className={styles['checkout-btn']}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                    Proceed to Checkout
                  </Link>
                  <Link to="/" className={styles['continue-shopping-btn']}>
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
