import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/app/layout';
import styles from './Checkout.module.css';

const PaymentPage: React.FC = () => {
  return (
    <Layout>
      <div className={styles.checkoutShell}>
        <section className={styles.formShell}>
          <div>
            <span className={styles.heroEyebrow}>Manual payment</span>
            <h2>Enter your card details</h2>
            <p className={styles.supportCopy}>
              Prefer a manual checkout? Add your card securely below. Payments are processed with industry-standard
              encryption and never stored on Designia servers.
            </p>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="cardNumber">Card number</label>
              <input className={styles.formInput} type="text" id="cardNumber" name="cardNumber" placeholder="•••• •••• •••• ••••" required />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="expiry">Expiry</label>
                <input className={styles.formInput} type="text" id="expiry" name="expiry" placeholder="MM / YY" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="cvc">CVC</label>
                <input className={styles.formInput} type="text" id="cvc" name="cvc" placeholder="•••" required />
              </div>
            </div>
          </div>
          <div className={styles.formActions}>
            <Link to="/checkout" className={styles.secondaryAction}>Back to checkout</Link>
            <button type="submit" className={styles.primaryAction}>Pay now</button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PaymentPage;