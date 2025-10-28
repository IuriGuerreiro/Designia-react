import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './StockErrorModal.module.css';

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

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const StockErrorModal: React.FC<StockErrorModalProps> = ({
  isOpen,
  onClose,
  onUpdateCart,
  stockErrors = [],
  unavailableProducts = [],
  failedItems = [],
  warnings = [],
  title = undefined,
  showUpdateButton = true,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const hasStockErrors = stockErrors.length > 0;
  const hasUnavailableProducts = unavailableProducts.length > 0;
  const hasFailedItems = failedItems.length > 0;
  const hasWarnings = warnings.length > 0;

  return (
    <div className={styles['stock-error-modal-overlay']} onClick={onClose}>
      <div className={styles['stock-error-modal']} onClick={(event) => event.stopPropagation()}>
        <div className={styles['stock-error-modal-header']}>
          <h2 className={styles['stock-error-modal-title']}>
            <span className={styles['warning-icon']}>⚠️</span>
            {title || t('cart.stock.title')}
          </h2>
          <button
            className={styles['stock-error-modal-close']}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className={styles['stock-error-modal-content']}>
          {hasWarnings && (
            <div className={styles['stock-error-section']}>
              {warnings.map((warning, index) => (
                <div key={index} className={styles['warning-message']}>
                  {warning}
                </div>
              ))}
            </div>
          )}

          {hasStockErrors && (
            <div className={styles['stock-error-section']}>
              <h3 className={styles['section-title']}>{t('cart.stock.issues')}</h3>
              {stockErrors.map((error, index) => (
                <div key={index} className={styles['stock-error-item']}>
                  <div className={styles['product-info']}>
                    <span className={styles['product-name']}>{error.product_name}</span>
                  </div>
                  <div className={styles['stock-info']}>
                    {error.error === 'OUT_OF_STOCK' ? (
                      <span className={styles['out-of-stock']}>
                        <span className={styles['error-icon']}>🚫</span>
                        {t('cart.stock.out_of_stock')}
                      </span>
                    ) : (
                      <span className={styles['insufficient-stock']}>
                        <span className={styles['error-icon']}>📦</span>
                        {t('cart.stock.only_available', { count: error.available_stock, requested: error.requested_quantity })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasUnavailableProducts && (
            <div className={styles['stock-error-section']}>
              <h3 className={styles['section-title']}>{t('cart.stock.unavailable_products')}</h3>
              {unavailableProducts.map((product, index) => (
                <div key={index} className={styles['unavailable-item']}>
                  <div className={styles['product-info']}>
                    <span className={styles['product-name']}>{product.product_name}</span>
                  </div>
                  <div className={styles['unavailable-reason']}>
                    <span className={styles['error-icon']}>❌</span>
                    {product.reason}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasFailedItems && (
            <div className={styles['stock-error-section']}>
              <h3 className={styles['section-title']}>{t('cart.stock.processing_issues')}</h3>
              {failedItems.map((item, index) => (
                <div key={index} className={styles['failed-item']}>
                  <div className={styles['product-info']}>
                    <span className={styles['product-name']}>{item.product_name}</span>
                  </div>
                  <div className={styles['failed-reason']}>
                    <span className={styles['error-icon']}>⚠️</span>
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles['stock-error-modal-actions']}>
          {showUpdateButton && onUpdateCart && (
            <button
              className={cx(styles.btn, styles['btn-primary'], styles['update-cart-btn'])}
              onClick={() => {
                onUpdateCart();
                onClose();
              }}
            >
              {t('cart.update_cart')}
            </button>
          )}
          <button
            className={cx(styles.btn, styles['btn-secondary'], styles['close-btn'])}
            onClick={onClose}
          >
            {t('orders.actions.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockErrorModal;
