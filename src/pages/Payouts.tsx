import React, { useState } from 'react';
import { 
  paymentService, 
  type PayoutRequest,
  type PayoutResponse
} from '../services/paymentService';
import PayoutsList from '../components/Marketplace/Stripe/PayoutsList';
import Layout from '../components/Layout/Layout';
import './Payouts.css';

type TabType = 'history' | 'create';

const Payouts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [creating, setCreating] = useState(false);

  const handleCreatePayout = async (payoutData: PayoutRequest) => {
    try {
      console.log('🔵 handleCreatePayout called with:', payoutData);
      setCreating(true);

      console.log('🔵 Calling paymentService.createSellerPayout...');
      const response: PayoutResponse = await paymentService.createSellerPayout(payoutData);
      console.log('🟢 Payout service response:', response);

      if (response.success) {
        console.log('🟢 Payout created successfully!');
        alert(`✅ Payout created successfully!\n\nPayout ID: ${response.payout.stripe_payout_id}\nAmount: ${response.payout.amount_formatted}\nStatus: ${response.payout.status}`);
        // Switch to history tab to see the new payout
        setActiveTab('history');
      } else {
        console.log('🔴 Payout creation failed:', response);
        alert(`❌ Payout creation failed: ${response.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('🔴 Error creating payout:', err);
      alert('❌ Network error occurred while creating payout. Please try again.');
    } finally {
      setCreating(false);
    }
  };

    return (
    <Layout maxWidth="full">
      <div className="payouts-page">
        <div className="payouts-container">
          {/* Hero Section */}
          <div className="payouts-hero">
            <h1 className="payouts-title">Payouts Management</h1>
            <p className="payouts-subtitle">
              View your payout history and create new payouts from your available balance
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="payouts-tabs">
            <button
              onClick={() => setActiveTab('history')}
              className={`payouts-tab ${activeTab === 'history' ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z"/>
                <path d="M14 2V8H20"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
              Payout History
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`payouts-tab ${activeTab === 'create' ? 'active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5V19M5 12H19"/>
              </svg>
              Create Payout
            </button>
          </div>

          {/* Tab Content */}
          <div className="payouts-content">
            {activeTab === 'history' && (
              <div className="payouts-history-section">
                <PayoutsList />
              </div>
            )}

            {activeTab === 'create' && (
              <div className="payouts-create-section">
                <div className="payouts-create-container">
                  <div className="payouts-create-card">
                    <div className="payouts-create-header">
                      <div className="payouts-create-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                          <path d="M2 17L12 22L22 17"/>
                          <path d="M2 12L12 17L22 12"/>
                        </svg>
                      </div>
                      <div className="payouts-create-text">
                        <h2 className="payouts-create-title">Create New Payout</h2>
                        <p className="payouts-create-description">
                          Request a payout using your available balance
                        </p>
                      </div>
                    </div>
                    
                    <div className="payouts-create-body">
                      <div className="payouts-create-info">
                        <div className="payouts-info-icon">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                            <path d="M2 17L12 22L22 17"/>
                            <path d="M2 12L12 17L22 12"/>
                          </svg>
                        </div>
                        <h3 className="payouts-info-title">Instant Payout</h3>
                        <p className="payouts-info-description">
                          Create a payout using your full available balance with auto-detected currency
                        </p>
                      </div>

                      <div className="payouts-create-actions">
                        <button
                          onClick={() => {
                            console.log('🔵 Button clicked - starting payout...');
                            console.log('🔵 Calling paymentService.createSellerPayout...');
                            
                            const payoutData: PayoutRequest = {
                              amount: 24784,
                              currency: 'eur',
                              description: 'Instant payout request',
                            };
                            
                            console.log('🔵 Payout data:', payoutData);
                            handleCreatePayout(payoutData);
                          }}
                          disabled={creating}
                          className="payouts-create-button"
                        >
                          {creating ? (
                            <>
                              <div className="payouts-button-spinner"></div>
                              Creating Payout...
                            </>
                          ) : (
                            <>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                                <path d="M2 17L12 22L22 17"/>
                                <path d="M2 12L12 17L22 12"/>
                              </svg>
                              Create Payout
                            </>
                          )}
                        </button>
                      </div>

                      <div className="payouts-info-box">
                        <div className="payouts-info-header">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                          <h4 className="payouts-info-heading">Payout Information</h4>
                        </div>
                        <ul className="payouts-info-list">
                          <li>Uses your full available balance</li>
                          <li>Currency is auto-detected</li>
                          <li>Funds typically arrive in 1-2 business days</li>
                          <li>You'll receive email confirmation when processed</li>
                        </ul>
                      </div>

                      <div className="payouts-view-link">
                        <button
                          onClick={() => setActiveTab('history')}
                          className="payouts-link-button"
                        >
                          View Previous Payouts
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12,5 19,12 12,19"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payouts;