import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import './Checkout.css';

const PaymentPage: React.FC = () => {
  return (
    <Layout>
      <div className="checkout-page-container">
        <h2>Payment</h2>
        <div className="standard-form">
          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <input type="text" id="cardNumber" name="cardNumber" placeholder="**** **** **** ****" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiry">Expiry Date</label>
              <input type="text" id="expiry" name="expiry" placeholder="MM/YY" required />
            </div>
            <div className="form-group">
              <label htmlFor="cvc">CVC</label>
              <input type="text" id="cvc" name="cvc" placeholder="***" required />
            </div>
          </div>
          <div className="form-actions">
            <Link to="/checkout" className="btn btn-secondary">Back to Shipping</Link>
            <button className="btn btn-primary">Pay Now</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentPage;