import React from 'react';
import './StockWarning.css';

interface StockWarningProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

const StockWarning: React.FC<StockWarningProps> = ({
  message,
  type = 'warning',
  onClose,
  className = '',
  compact = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return '🚫';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '⚠️';
    }
  };

  return (
    <div className={`stock-warning stock-warning--${type} ${compact ? 'stock-warning--compact' : ''} ${className}`}>
      <div className="stock-warning__content">
        <span className="stock-warning__icon">{getIcon()}</span>
        <span className="stock-warning__message">{message}</span>
      </div>
      {onClose && (
        <button 
          className="stock-warning__close"
          onClick={onClose}
          aria-label="Dismiss warning"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default StockWarning;