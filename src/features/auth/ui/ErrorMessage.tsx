import React from 'react';
import styles from './Auth.module.css';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  center?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose, center }) => {
  // Determine error type based on message content
  const getErrorType = (msg: string): string => {
    if (msg.includes('Service may be unavailable') || msg.includes('Service unavailable') || msg.includes('try again later')) {
      return 'service-error';
    }
    if (msg.includes('network') || msg.includes('connection')) {
      return 'network-error';
    }
    return '';
  };

  const errorType = getErrorType(message);

  return (
    <div className={`${styles['error-message']} ${errorType ? styles[errorType] : ''} ${center ? styles['error-centered'] : ''}`}>
      <span className={styles['error-text']}>{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          className={styles['error-close']}
          type="button"
          aria-label="Close error message"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
