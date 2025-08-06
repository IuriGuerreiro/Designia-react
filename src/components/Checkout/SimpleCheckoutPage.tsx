import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import './Checkout.css';
import { useTranslation, Trans } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import { orderService } from '../../services';

const SimpleCheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, clearCart, isLoading: cartLoading } = useCart();
  
  // Filter active items only for checkout
  const activeCartItems = cartItems.filter(item => item.isActive !== false);
  const inactiveItemsCount = cartItems.length - activeCartItems.length;
  
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States'
  });

  // Redirect if cart is empty or no active items
  useEffect(() => {
    if (!cartLoading && (cartItems.length === 0 || activeCartItems.length === 0)) {
      navigate('/cart');
    }
  }, [cartItems.length, activeCartItems.length, cartLoading, navigate]);

  // Calculate costs based on active items only
  const subtotal = activeCartItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);
  const shippingCost = shippingMethod === 'express' ? 49.99 : 19.99;
  const taxAmount = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shippingCost + taxAmount;

  // Handle order creation without payment
  const handleCreateOrder = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required shipping information.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('=== CREATING ORDER FROM CART ===');
      console.log('Raw values:', {
        subtotal: subtotal,
        subtotalType: typeof subtotal,
        shippingCost: shippingCost,
        shippingCostType: typeof shippingCost,
        taxAmount: taxAmount,
        taxAmountType: typeof taxAmount,
        total: total,
        totalType: typeof total
      });

      // Send monetary values as precise numbers (not floats that could have precision issues)
      const orderPayload = {
        shipping_address: shippingAddress,
        shipping_cost: Math.round(shippingCost * 100) / 100, // Avoid floating point precision issues
        tax_amount: Math.round(taxAmount * 100) / 100, // Avoid floating point precision issues
        discount_amount: 0, // Send as integer
        buyer_notes: `Shipping method: ${shippingMethod}`
      };

      console.log('Order payload:', orderPayload);
      console.log('Payload types:', {
        shipping_cost: typeof orderPayload.shipping_cost,
        tax_amount: typeof orderPayload.tax_amount,
        discount_amount: typeof orderPayload.discount_amount
      });

      // Create order from cart
      const order = await orderService.createOrderFromCart(orderPayload);

      console.log('Order created successfully:', order);

      // Clear cart after successful order
      await clearCart();

      // Redirect to order success page
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      console.error('Failed to create order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Validate form before allowing order creation
  const isFormValid = () => {
    return shippingAddress.name && 
           shippingAddress.street && 
           shippingAddress.city && 
           shippingAddress.state && 
           shippingAddress.postal_code;
  };

  return (
    <Layout>
      <div className="checkout-page-container">
        <div className="checkout-main-content">
          <div className="checkout-header">
            <h1>{t('checkout.title')}</h1>
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            {isProcessing && (
              <div className="processing-message">
                <p>Creating your order...</p>
              </div>
            )}
          </div>

          <div className="checkout-section">
            <div className="section-header">
              <h2>1. {t('checkout.shipping_address_title')}</h2>
            </div>
            <div className="section-content address-details">
              <div className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="street">Street Address *</label>
                  <input
                    type="text"
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="postal_code">ZIP Code *</label>
                    <input
                      type="text"
                      id="postal_code"
                      value={shippingAddress.postal_code}
                      onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <div className="section-header">
              <h2>2. {t('checkout.review_items_title')}</h2>
            </div>
            <div className="section-content">
              <div className="delivery-options">
                <h4>{t('checkout.delivery_option_title')}</h4>
                <div
                  className={`delivery-option ${shippingMethod === 'standard' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('standard')}
                >
                  <p><strong>{t('checkout.standard_shipping_title')}</strong></p>
                  <p>{t('checkout.standard_shipping_eta')}</p>
                  <p className="price">$19.99</p>
                </div>
                <div
                  className={`delivery-option ${shippingMethod === 'express' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('express')}
                >
                  <p><strong>{t('checkout.express_shipping_title')}</strong></p>
                  <p>{t('checkout.express_shipping_eta')}</p>
                  <p className="price">$49.99</p>
                </div>
              </div>
              
              <div className="cart-items-review">
                <h4>Items in Your Order</h4>
                {cartItems.map(item => (
                  <div className="cart-item-row" key={item.id}>
                    <img 
                      src={item.image || item.imageUrl || '/placeholder-product.png'} 
                      alt={item.name} 
                      className="item-image" 
                    />
                    <div className="item-details">
                      <p><strong>{item.name}</strong></p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <p className="item-price">
                      ${(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <div className="section-header">
              <h2>3. Finalize Order</h2>
            </div>
            <div className="section-content">
              <div className="order-finalization">
                <div className="payment-notice">
                  <div className="notice-box">
                    <h4>📦 Order will be processed immediately</h4>
                    <p>Your order will be created and sent to the sellers for processing. You'll receive order confirmation and tracking information via email.</p>
                  </div>
                </div>
                
                <button 
                  className={`btn btn-primary btn-large finalize-order-btn ${!isFormValid() || isProcessing ? 'disabled' : ''}`}
                  onClick={handleCreateOrder}
                  disabled={!isFormValid() || isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                </button>
                
                <p className="terms">
                  <Trans i18nKey="checkout.terms_agreement">
                    By placing your order, you agree to our <Link to="/terms">terms and conditions</Link>.
                  </Trans>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-summary">
          <div className="summary-card">
            <h3>{t('checkout.order_summary_title')}</h3>
            <div className="summary-row">
              <span>{t('checkout.subtotal_label')}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>{t('checkout.shipping_label')}</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>{t('checkout.total_label')}</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <div className="payment-method-info">
              <h4>Payment Method</h4>
              <div className="payment-method-notice">
                <p>💳 Cash on Delivery</p>
                <p className="payment-note">Payment will be collected upon delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimpleCheckoutPage;