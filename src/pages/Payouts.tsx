import React from 'react';
import { Layout } from '@/app/layout';
import PayoutsList from '@/features/marketplace/ui/stripe/PayoutsList';
import styles from './Payouts.module.css';

const Payouts: React.FC = () => {
  return (
    <Layout maxWidth="full">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Payouts management</h1>
          <p className={styles.subtitle}>
            Review your recent payout activity and monitor transfers from your available balance.
          </p>
        </header>

        <div className={styles.content}>
          <section aria-label="Payout history" className={styles.historyCard}>
            <PayoutsList />
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Payouts;
