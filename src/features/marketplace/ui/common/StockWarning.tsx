import React from 'react';
import styles from './StockWarning.module.css';

interface StockWarningProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const StockWarning: React.FC<StockWarningProps> = ({
  message,
  type = 'warning',
  onClose,
  className,
  compact = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return '🚫';
      case 'info':
        return 'ℹ️';
      case 'warning':
      default:
        return '⚠️';
    }
  };

  return (
    <div
      className={cx(
        styles['stock-warning'],
        styles[`stock-warning--${type}`],
        compact && styles['stock-warning--compact'],
        className,
      )}
    >
      <div className={styles['stock-warning__content']}>
        <span className={styles['stock-warning__icon']}>{getIcon()}</span>
        <span className={styles['stock-warning__message']}>{message}</span>
      </div>
      {onClose && (
        <button
          className={styles['stock-warning__close']}
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
