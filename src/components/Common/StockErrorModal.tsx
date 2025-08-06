import React from 'react';
import './StockErrorModal.css';

interface StockError {
  product_id: string;
  product_name: string;
  requested_quantity: number;
  available_stock: number;
  error: 'INSUFFICIENT_STOCK' | 'OUT_OF_STOCK';
}

interface UnavailableProduct {
  product_name: string;
  reason: string;
}

interface FailedItem {
  product_name: string;
  reason: string;
}

interface StockErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCart?: () => void;
  stockErrors?: StockError[];
  unavailableProducts?: UnavailableProduct[];
  failedItems?: FailedItem[];
  warnings?: string[];
  title?: string;
  showUpdateButton?: boolean;
}

const StockErrorModal: React.FC<StockErrorModalProps> = ({
  isOpen,
  onClose,
  onUpdateCart,
  stockErrors = [],
  unavailableProducts = [],
  failedItems = [],
  warnings = [],
  title = 'Stock Issues Detected',
  showUpdateButton = true
}) => {
  if (!isOpen) return null;

  const hasStockErrors = stockErrors.length > 0;
  const hasUnavailableProducts = unavailableProducts.length > 0;
  const hasFailedItems = failedItems.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <div className="stock-error-modal-overlay" onClick={onClose}>
      <div className="stock-error-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stock-error-modal-header">
          <h2 className="stock-error-modal-title">
            <span className="warning-icon">⚠️</span>
            {title}
          </h2>
          <button 
            className="stock-error-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="stock-error-modal-content">
          {hasWarnings && (
            <div className="stock-error-section">
              {warnings.map((warning, index) => (
                <div key={index} className="warning-message">
                  {warning}
                </div>
              ))}
            </div>
          )}

          {hasStockErrors && (
            <div className="stock-error-section">
              <h3 className="section-title">Stock Issues</h3>
              {stockErrors.map((error, index) => (
                <div key={index} className="stock-error-item">
                  <div className="product-info">
                    <span className="product-name">{error.product_name}</span>
                  </div>
                  <div className="stock-info">
                    {error.error === 'OUT_OF_STOCK' ? (
                      <span className="out-of-stock">
                        <span className="error-icon">🚫</span>
                        Currently out of stock
                      </span>
                    ) : (
                      <span className="insufficient-stock">
                        <span className="error-icon">📦</span>
                        Only {error.available_stock} available 
                        (you requested {error.requested_quantity})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasUnavailableProducts && (
            <div className="stock-error-section">
              <h3 className="section-title">Unavailable Products</h3>
              {unavailableProducts.map((product, index) => (
                <div key={index} className="unavailable-item">
                  <div className="product-info">
                    <span className="product-name">{product.product_name}</span>
                  </div>
                  <div className="unavailable-reason">
                    <span className="error-icon">❌</span>
                    {product.reason}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasFailedItems && (
            <div className="stock-error-section">
              <h3 className="section-title">Processing Issues</h3>
              {failedItems.map((item, index) => (
                <div key={index} className="failed-item">
                  <div className="product-info">
                    <span className="product-name">{item.product_name}</span>
                  </div>
                  <div className="failed-reason">
                    <span className="error-icon">⚠️</span>
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stock-error-modal-actions">
          {showUpdateButton && onUpdateCart && (
            <button 
              className="btn btn-primary update-cart-btn"
              onClick={() => {
                onUpdateCart();
                onClose();
              }}
            >
              Update Cart
            </button>
          )}
          <button 
            className="btn btn-secondary close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockErrorModal;