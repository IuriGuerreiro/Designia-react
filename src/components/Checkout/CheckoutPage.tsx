import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import './Checkout.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import { useTranslation, Trans } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import { orderService } from '../../services';
import StockErrorModal from '../Common/StockErrorModal';
import StockWarning from '../Common/StockWarning';

const stripePromise = loadStripe('pk_test_51Hh9ZQEa3gK1j2f6g8dY3f3GgV0g3gH7gJ6gK5gL4gM3gN2gO1gP0gQ1gR2gS3gT4gU5gV6gW7');

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, clearCart, isLoading: cartLoading } = useCart();
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [clientSecret, setClientSecret] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter active items only for checkout
  const activeCartItems = cartItems.filter(item => item.isActive !== false);
  const inactiveItemsCount = cartItems.length - activeCartItems.length;
  const [stockErrors, setStockErrors] = useState<any[]>([]);
  const [unavailableProducts, setUnavailableProducts] = useState<any[]>([]);
  const [failedItems, setFailedItems] = useState<any[]>([]);
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);
  const [showStockModal, setShowStockModal] = useState(false);
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

  // Handle payment success with comprehensive stock error handling
  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    setError(null);
    setStockErrors([]);
    setUnavailableProducts([]);
    setFailedItems([]);
    setStockWarnings([]);

    try {
      // Create order from cart
      const result = await orderService.createOrderFromCart({
        shipping_address: shippingAddress,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        buyer_notes: ''
      });

      if (result.success && result.order) {
        // Successful order creation
        if (result.partialSuccess && result.failedItems?.length) {
          // Partial success - some items failed
          setFailedItems(result.failedItems);
          setStockWarnings(result.warnings || []);
          setShowStockModal(true);
        }

        // Clear cart after successful order
        await clearCart();

        // Redirect to order success page
        navigate(`/order-success/${result.order.id}`);
      } else {
        // Stock validation failed - show detailed errors
        if (result.stockErrors?.length || result.unavailableProducts?.length) {
          setStockErrors(result.stockErrors || []);
          setUnavailableProducts(result.unavailableProducts || []);
          setStockWarnings(result.warnings || []);
          setShowStockModal(true);
        } else {
          setError('Unable to process your order. Please try again.');
        }
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle updating cart when stock issues are found
  const handleUpdateCart = () => {
    navigate('/cart');
  };

  // Validate form before allowing payment
  const isFormValid = () => {
    return shippingAddress.name && 
           shippingAddress.street && 
           shippingAddress.city && 
           shippingAddress.state && 
           shippingAddress.postal_code;
  };

  const options = {
    clientSecret,
    appearance: {
        theme: 'stripe',
    },
  };

  return (
    <Layout>
      <div className="checkout-page-container">
        <div className="checkout-main-content">
          <div className="checkout-header">
            <h1>{t('checkout.title')}</h1>
            {error && (
              <StockWarning 
                message={error} 
                type="error" 
                onClose={() => setError(null)} 
              />
            )}
            {stockWarnings.map((warning, index) => (
              <StockWarning 
                key={index}
                message={warning} 
                type="warning" 
              />
            ))}
            {inactiveItemsCount > 0 && (
              <StockWarning 
                message={`${inactiveItemsCount} item${inactiveItemsCount > 1 ? 's' : ''} in your cart ${inactiveItemsCount > 1 ? 'are' : 'is'} not available and will not be included in this order.`}
                type="warning" 
              />
            )}
            {isProcessing && (
              <div className="processing-message">
                <p>Processing your order...</p>
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
              <h2>2. {t('checkout.payment_method_title')}</h2>
            </div>
            <div className="section-content payment-details">
              {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                  <PaymentForm 
                    onPaymentSuccess={handlePaymentSuccess}
                    orderData={{
                      shipping_address: shippingAddress,
                      shipping_cost: shippingCost,
                      tax_amount: taxAmount,
                      total_amount: total
                    }}
                  />
                </Elements>
              )}
              {!clientSecret && (
                <div className="payment-placeholder">
                  <p>Loading payment options...</p>
                </div>
              )}
            </div>
          </div>

          <div className="checkout-section">
            <div className="section-header">
              <h2>3. {t('checkout.review_items_title')}</h2>
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
                <h4>Items to be ordered ({activeCartItems.length})</h4>
                {activeCartItems.map(item => (
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
                {inactiveItemsCount > 0 && (
                  <div className="inactive-items-notice">
                    <p><em>{inactiveItemsCount} item{inactiveItemsCount > 1 ? 's' : ''} not available and excluded from this order.</em></p>
                    <Link to="/cart" className="review-cart-link">Review cart →</Link>
                  </div>
                )}
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
              <span>{t('checkout.tax_label')}</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>{t('checkout.total_label')}</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <p className="terms">
                <Trans i18nKey="checkout.terms_agreement">
                    By placing your order, you agree to our <Link to="/terms">terms and conditions</Link>.
                </Trans>
            </p>
          </div>
        </div>
      </div>

      {/* Stock Error Modal */}
      <StockErrorModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        onUpdateCart={handleUpdateCart}
        stockErrors={stockErrors}
        unavailableProducts={unavailableProducts}
        failedItems={failedItems}
        warnings={stockWarnings}
        title={stockErrors.length > 0 || unavailableProducts.length > 0 ? 
          "Cannot Complete Checkout" : 
          "Order Processed with Issues"
        }
        showUpdateButton={stockErrors.length > 0 || unavailableProducts.length > 0}
      />
    </Layout>
  );
};

export default CheckoutPage;