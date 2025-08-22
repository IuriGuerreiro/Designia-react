import React, { useState } from 'react';
import { 
  paymentService, 
  type PayoutRequest,
  type PayoutResponse
} from '../services/paymentService';
import PayoutsList from '../components/Marketplace/Stripe/PayoutsList';
import Layout from '../components/Layout/Layout';
import '../styles/Payouts.css';

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
    <Layout>
      <div className="payouts-container">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payouts Management</h1>
          <p className="text-gray-600">
            View your payout history and create new payouts from your available balance
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md border border-gray-200">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📋 Payout History
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              💰 Create Payout
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'history' && (
            <div className="payout-history-tab">
              <PayoutsList />
            </div>
          )}

          {activeTab === 'create' && (
            <div className="create-payout-tab">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">Create New Payout</h2>
                    <p className="text-green-100 text-sm mt-1">
                      Request a payout using your available balance
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="text-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                          <span className="text-2xl">💰</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Instant Payout
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Create a payout using your full available balance with auto-detected currency
                        </p>
                      </div>

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
                        className="create-payout-btn text-white py-4 px-8 rounded-lg font-medium inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                      >
                        {creating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                            Creating Payout...
                          </>
                        ) : (
                          <>
                            <span className="mr-3">💸</span>
                            Create Payout
                          </>
                        )}
                      </button>

                      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <span className="text-blue-500 text-lg">ℹ️</span>
                          </div>
                          <div className="ml-3 text-left">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">
                              Payout Information
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Uses your full available balance</li>
                              <li>• Currency is auto-detected</li>
                              <li>• Funds typically arrive in 1-2 business days</li>
                              <li>• You'll receive email confirmation when processed</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab('history')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                        >
                          View Previous Payouts →
                        </button>
                      </div>
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