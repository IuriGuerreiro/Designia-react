import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Layout } from '@/app/layout';
import styles from './Checkout.module.css';

const PaymentPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className={styles.checkoutShell}>
        <section className={styles.formShell}>
          <div>
            <span className={styles.heroEyebrow}>{t('checkout.manual_payment')}</span>
            <h2>{t('checkout.enter_card_details')}</h2>
            <p className={styles.supportCopy}>{t('checkout.manual_support_copy')}</p>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="cardNumber">{t('checkout.card_number')}</label>
              <input className={styles.formInput} type="text" id="cardNumber" name="cardNumber" placeholder="•••• •••• •••• ••••" required />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="expiry">{t('checkout.expiry')}</label>
                <input className={styles.formInput} type="text" id="expiry" name="expiry" placeholder="MM / YY" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="cvc">{t('checkout.cvc')}</label>
                <input className={styles.formInput} type="text" id="cvc" name="cvc" placeholder="•••" required />
              </div>
            </div>
          </div>
          <div className={styles.formActions}>
            <Link to="/checkout" className={styles.secondaryAction}>{t('checkout.back_to_checkout')}</Link>
            <button type="submit" className={styles.primaryAction}>{t('checkout.pay_now')}</button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PaymentPage;
