import React, { useState, useEffect } from 'react';
import { apiRequest, API_ENDPOINTS } from '../../shared/api';
import TwoFactorVerifyModal from './TwoFactorVerifyModal';
import './TwoFactorAuth.css';

interface TwoFactorStatus {
  two_factor_enabled: boolean;
  email: string;
}

const TwoFactorAuth: React.FC = () => {
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | null>(null);

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.TWO_FACTOR_STATUS);
      setTwoFactorStatus(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async (enable: boolean) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiRequest(API_ENDPOINTS.TWO_FACTOR_TOGGLE, {
        method: 'POST',
        body: JSON.stringify({ enable }),
      });

      if (response.requires_verification) {
        setPendingAction(enable ? 'enable' : 'disable');
        setShowVerifyModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerifyModal(false);
    setPendingAction(null);
    fetchTwoFactorStatus();
  };

  const handleVerificationCancel = () => {
    setShowVerifyModal(false);
    setPendingAction(null);
  };

  if (loading && !twoFactorStatus) {
    return (
      <div className="two-factor-auth">
        <div className="loading">Loading 2FA settings...</div>
      </div>
    );
  }

  return (
    <div className="two-factor-auth">
      <div className="two-factor-simple">
        <div className="two-factor-info">
          <span className="email">{twoFactorStatus?.email}</span>
          <span className="status">
            {twoFactorStatus?.two_factor_enabled ? '2FA Enabled' : '2FA Disabled'}
          </span>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
                  <div className="two-factor-actions">
            <button
              className={`2fa-btn ${twoFactorStatus?.two_factor_enabled ? '2fa-btn-danger' : '2fa-btn-primary'}`}
              onClick={() => handleToggle2FA(!twoFactorStatus?.two_factor_enabled)}
              disabled={loading}
            >
              {loading ? 'Processing...' : (
                twoFactorStatus?.two_factor_enabled ? 'Disable' : 'Enable'
              )}
            </button>
          </div>
      </div>

      {showVerifyModal && pendingAction && (
        <TwoFactorVerifyModal
          action={pendingAction}
          onSuccess={handleVerificationSuccess}
          onCancel={handleVerificationCancel}
        />
      )}
    </div>
  );
};

export default TwoFactorAuth;