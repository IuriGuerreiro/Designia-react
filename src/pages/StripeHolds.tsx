import React, { useState, useEffect } from 'react';
import styles from '../styles/StripeHolds.module.css';
import { paymentService, type HoldsSummary, type PaymentHoldsResponse, type PaymentTransaction } from '../features/payments/api';

void styles;


const StripeHolds: React.FC = () => {
  const [holds, setHolds] = useState<PaymentTransaction[]>([]);
  const [summary, setSummary] = useState<HoldsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPaymentHolds();
  }, []);

  const fetchPaymentHolds = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: PaymentHoldsResponse = await paymentService.getSellerPaymentHolds();

      if (data.success) {
        setHolds(data.holds);
        setSummary(data.summary);
      } else {
        setError(data.message || 'Failed to fetch payment holds');
      }
    } catch (err) {
      setError('Network error occurred while fetching payment holds');
      console.error('Error fetching payment holds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferPayment = async (transactionId: string) => {
    try {
      // Add transaction to transferring set
      setTransferring(prev => new Set([...prev, transactionId]));

      const response = await paymentService.transferPaymentToSeller({
        transaction_id: transactionId
      });

      if (response.success) {
        // Show success message
        alert(`✅ Payment transferred successfully!\n\nTransfer ID: ${response.transfer_details.transfer_id}\nAmount: $${response.transfer_details.amount_dollars} ${response.transfer_details.currency.toUpperCase()}`);
        
        // Refresh the holds list to show updated status
        await fetchPaymentHolds();
      } else {
        // Show error message
        alert(`❌ Transfer failed: ${response.detail || response.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error transferring payment:', err);
      alert('❌ Network error occurred while transferring payment. Please try again.');
    } finally {
      // Remove transaction from transferring set
      setTransferring(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | string, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getRemainingTimeDisplay = (holdStatus: any) => {
    if (holdStatus.is_ready_for_release) {
      return (
        <div className="flex items-center text-green-600 font-medium">
          <span className="mr-2 text-lg">✅</span>
          Ready for release
        </div>
      );
    }

    return (
      <div className="flex items-center text-blue-600 font-medium">
        <span className="mr-2 text-lg">⏰</span>
        {holdStatus.time_display}
      </div>
    );
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'progress-gradient-green';
    if (percentage >= 70) return 'progress-gradient-yellow';
    if (percentage >= 40) return 'progress-gradient-orange';
    return 'progress-gradient-blue';
  };

  const ProgressBar = ({ percentage, holdStatus }: { percentage: number, holdStatus: any }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-600">
          <span>Started {formatDate(holdStatus.hold_start_date || '')}</span>
          <span className="font-medium">{percentage.toFixed(1)}% complete</span>
          <span>Releases {formatDate(holdStatus.planned_release_date || '')}</span>
        </div>
      </div>
    );
  };

  const getStatusBadgeColor = (status: string, isReady: boolean = false) => {
    if (isReady) {
      return 'bg-green-100 text-green-800 border-green-200 animate-pulse';
    }
    
    switch (status) {
      case 'held':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'released':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-lg">Loading payment holds...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payment Holds</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPaymentHolds}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Holds</h1>
        <p className="text-gray-600">
          View and track your payment holds with remaining release times
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl text-blue-500">
                📦
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Holds</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.total_holds}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl text-green-500">
                💰
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(summary.total_pending_amount, summary.currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl text-green-500">
                ✅
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ready for Release</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.ready_for_release_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-3xl text-orange-500">
                ⏰
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Still Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.total_holds - summary.ready_for_release_count}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Holds List */}
      {holds.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Payment Holds</h2>
          <p className="text-gray-600">You currently have no payments on hold.</p>
        </div>
      ) : (
        <div className="space-y-6 payment-holds-container">
          {holds.map((transaction) => (
            <div key={transaction.transaction_id} className="hold-card bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Order #{transaction.order_id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Transaction: {transaction.transaction_id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Purchased {formatDate(transaction.order_details.purchase_date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeColor(transaction.hold_status.status, transaction.hold_status.is_ready_for_release)}`}>
                      {transaction.hold_status.is_ready_for_release ? '🎉 Ready for Release' : transaction.hold_status.status_display}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(transaction.amounts.net_amount, transaction.amounts.currency)}
                      </p>
                      <p className="text-xs text-gray-500">Net Amount</p>
                    </div>
                    
                    {/* Transfer Button - Show only if ready for release */}
                    {transaction.hold_status.is_ready_for_release && (
                      <button
                        onClick={() => handleTransferPayment(transaction.transaction_id)}
                        disabled={transferring.has(transaction.transaction_id)}
                        className="transfer-button text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium"
                        title="Transfer payment to your connected Stripe account"
                      >
                        {transferring.has(transaction.transaction_id) ? (
                          <span className="transfer-button-text">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                            Transferring...
                          </span>
                        ) : (
                          <span className="transfer-button-text">
                            <span className="mr-2">💸</span>
                            Transfer Payment
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Hold Progress</span>
                    {getRemainingTimeDisplay(transaction.hold_status)}
                  </div>
                  <ProgressBar 
                    percentage={transaction.hold_status.progress_percentage} 
                    holdStatus={transaction.hold_status} 
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Buyer Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2 text-lg">👤</span>
                      Buyer Information
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Name:</span>{' '}
                        <span className="text-gray-900">
                          {transaction.buyer.first_name && transaction.buyer.last_name 
                            ? `${transaction.buyer.first_name} ${transaction.buyer.last_name}`
                            : transaction.buyer.username}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Username:</span>{' '}
                        <span className="text-gray-900">@{transaction.buyer.username}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Email:</span>{' '}
                        <span className="text-gray-900">{transaction.buyer.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2 text-lg">💰</span>
                      Payment Breakdown
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Gross Amount:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amounts.gross_amount, transaction.amounts.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-red-600">Platform Fee:</span>
                        <span className="text-sm font-medium text-red-600">
                          -{formatCurrency(transaction.amounts.platform_fee, transaction.amounts.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-red-600">Stripe Fee:</span>
                        <span className="text-sm font-medium text-red-600">
                          -{formatCurrency(transaction.amounts.stripe_fee, transaction.amounts.currency)}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-sm font-bold text-green-700">You'll Receive:</span>
                        <span className="text-sm font-bold text-green-700">
                          {formatCurrency(transaction.amounts.net_amount, transaction.amounts.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hold Details */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2 text-lg">🔒</span>
                      Hold Details
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Reason:</span>{' '}
                        <span className="text-gray-900">{transaction.hold_status.reason_display}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Duration:</span>{' '}
                        <span className="text-gray-900">{transaction.hold_status.total_hold_days} days</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Remaining:</span>{' '}
                        <span className="text-blue-600 font-semibold">{transaction.hold_status.time_display}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {transaction.order_details.items.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2 text-lg">📦</span>
                      Items ({transaction.order_details.item_count})
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {transaction.order_details.items.map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                                <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {transaction.hold_status.hold_notes && (
                  <div className="mt-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2 text-lg">📝</span>
                      Notes
                    </h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{transaction.hold_status.hold_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={fetchPaymentHolds}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center mx-auto"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Refreshing...
            </>
          ) : (
            <>
              <span className="mr-2">🔄</span>
              Refresh Holds
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StripeHolds;