import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import PayoutsList from '../components/Marketplace/Stripe/PayoutsList';
import { paymentService, type PayoutRequest, type PayoutResponse } from '../features/payments/api';
import styles from './Payouts.module.css';

type TabType = 'history' | 'create';

const Payouts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [creating, setCreating] = useState(false);

  const getTabClassName = (tab: TabType) =>
    [styles.tab, activeTab === tab ? styles.tabActive : ''].filter(Boolean).join(' ');

  const handleCreatePayout = async (payoutData: PayoutRequest) => {
    try {
      setCreating(true);
      const response: PayoutResponse = await paymentService.createSellerPayout(payoutData);

      if (response.success) {
        alert(`✅ Payout created successfully!\n\nPayout ID: ${response.payout.stripe_payout_id}\nAmount: ${response.payout.amount_formatted}\nStatus: ${response.payout.status}`);
        setActiveTab('history');
      } else {
        alert(`❌ Payout creation failed: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating payout:', error);
      alert('❌ Network error occurred while creating payout. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout maxWidth="full">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Payouts management</h1>
          <p className={styles.subtitle}>
            Review your recent payout activity and request new transfers from your available balance.
          </p>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Payout workflow">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            className={getTabClassName('history')}
            onClick={() => setActiveTab('history')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" />
              <path d="M14 2V8H20" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            History
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'create'}
            className={getTabClassName('create')}
            onClick={() => setActiveTab('create')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 5V19" />
              <path d="M5 12H19" />
            </svg>
            New payout
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'history' && (
            <section aria-label="Payout history" className={styles.historyCard}>
              <PayoutsList />
            </section>
          )}

          {activeTab === 'create' && (
            <section aria-label="Create payout" className={styles.createSection}>
              <article className={styles.createCard}>
                <div className={styles.createHeader}>
                  <div className={styles.iconShell}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                      <path d="M2 17L12 22L22 17" />
                      <path d="M2 12L12 17L22 12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>Create new payout</h2>
                    <p className={styles.cardDescription}>Request a payout using your available balance.</p>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div>
                    <h3 className={styles.cardTitle}>Instant transfer</h3>
                    <p className={styles.cardDescription}>
                      Generate a payout using your full available balance with automatic currency detection.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() =>
                      handleCreatePayout({
                        amount: 24784,
                        currency: 'eur',
                        description: 'Instant payout request',
                      })
                    }
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className={styles.spinner} aria-hidden />
                        Creating payout…
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                          <path d="M2 17L12 22L22 17" />
                          <path d="M2 12L12 17L22 12" />
                        </svg>
                        Create payout
                      </>
                    )}
                  </button>

                  <div className={styles.infoPanel}>
                    <div className={styles.infoHeader}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>Payout information</span>
                    </div>
                    <ul className={styles.infoList}>
                      <li>Uses your full available balance</li>
                      <li>Currency is auto-detected</li>
                      <li>Funds typically arrive within 1–2 business days</li>
                      <li>Email confirmation is sent once processing completes</li>
                    </ul>
                  </div>
                </div>

                <div className={styles.viewLink}>
                  <button type="button" className={styles.linkButton} onClick={() => setActiveTab('history')}>
                    View payout history
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12,5 19,12 12,19" />
                    </svg>
                  </button>
                </div>
              </article>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Payouts;
