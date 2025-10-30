import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/app/layout';
import ProductReviews from './ProductReviews';
import { useCart } from '@/shared/state/CartContext';
import { useTheme } from '@/shared/state/ThemeContext';
import { useTranslation } from 'react-i18next';
import { productService } from '@/features/marketplace/api';
import { type Product } from '@/features/marketplace/model';
import ViewSellerAccount from '@/features/marketplace/ui/seller/ViewSellerAccount';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { tokens } = useTheme();
  const { t } = useTranslation();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specifications' | 'seller'>('details');

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      try {
        const data = await productService.getProduct(slug);
        setProduct(data);
      } catch (err) {
        setError(t('products.detail.not_found_message'));
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        quantity,
        slug: product.slug,
        imageUrl: product.images?.[0]?.presigned_url || '/placeholder-product.png',
        // Provide stock info so client-side guard can prevent exceeding stock
        availableStock: product.stock_quantity,
        isActive: product.is_in_stock,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles['product-detail-page']}>
          {/* Breadcrumb Navigation Skeleton */}
          <nav className={styles['breadcrumb-nav']}>
            <div className={styles['skeleton-line']} style={{ width: '80px', height: '16px' }}></div>
            <span className={styles['breadcrumb-separator']}>/</span>
            <div className={styles['skeleton-line']} style={{ width: '120px', height: '16px' }}></div>
          </nav>

          {/* Main Product Content Skeleton */}
          <div className={styles['product-skeleton']}>
            {/* Image Gallery Skeleton */}
            <div className={styles['skeleton-gallery']}>
              <div className={styles['skeleton-main-image']}></div>
              <div className={styles['skeleton-thumbnails']}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className={styles['skeleton-thumbnail']}></div>
                ))}
              </div>
            </div>

            {/* Product Information Skeleton */}
            <div className={styles['skeleton-product-info']}>
              <div className={styles['skeleton-title']}></div>
              <div className={styles['skeleton-meta']}></div>
              <div className={styles['skeleton-price']}></div>
              <div className={styles['skeleton-description']}>
                <div className={styles['skeleton-description-line']}></div>
                <div className={styles['skeleton-description-line']}></div>
                <div className={styles['skeleton-description-line']}></div>
              </div>
              <div className={styles['skeleton-actions']}></div>
            </div>
          </div>

          {/* Product Details Tabs Skeleton */}
          <div className={styles['skeleton-tabs']}>
            <div className={styles['skeleton-tab-navigation']}></div>
            <div className={styles['skeleton-tab-content']}>
              <div className={styles['skeleton-detail-item']}></div>
              <div className={styles['skeleton-detail-item']}></div>
              <div className={styles['skeleton-detail-item']}></div>
              <div className={styles['skeleton-detail-item']}></div>
            </div>
          </div>

          {/* Reviews Section Skeleton */}
          <div className={styles['reviews-section']}>
            <div className={styles['reviews-header']}>
              <div className={styles['skeleton-title']} style={{ width: '200px', height: '32px' }}></div>
              <div className={styles['skeleton-meta']} style={{ width: '150px', height: '20px' }}></div>
            </div>
            <div className={styles['reviews-content']}>
              {[1, 2, 3].map((index) => (
                <div key={index} className={styles['review-skeleton']}>
                  <div className={styles['skeleton-header']}>
                    <div className={styles['skeleton-avatar']}></div>
                    <div className={styles['skeleton-info']}>
                      <div className={styles['skeleton-name']}></div>
                      <div className={styles['skeleton-meta']}>
                        <div className={styles['skeleton-stars']}></div>
                        <div className={styles['skeleton-date']}></div>
                      </div>
                    </div>
                  </div>
                  <div className={styles['skeleton-content']}>
                    <div className={styles['skeleton-title']}></div>
                    <div className={styles['skeleton-comment']}>
                      <div className={styles['skeleton-line']}></div>
                      <div className={styles['skeleton-line']}></div>
                      <div className={`${styles['skeleton-line']} ${styles['short']}`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className={styles['product-detail-error']}>
          <div className={styles['error-icon']}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>{t('products.detail.not_found_title')}</h3>
          <p>{error || t('products.detail.not_found_message')}</p>
          <Link to="/products" className={styles['back-to-products-btn']}>
            {t('products.detail.browse_products')}
          </Link>
        </div>
      </Layout>
    );
  }

  const selectedImage = product.images?.[selectedImageIndex]?.presigned_url || '/placeholder-product.png';

  return (
    <Layout>
      <div 
        className={styles['product-detail-page']}
        style={{ 
          background: tokens.background,
          color: tokens.textPrimary 
        }}
      >
        {/* Breadcrumb Navigation */}
        <nav 
          className={styles['breadcrumb-nav']}
          style={{ color: tokens.textSecondary }}
        >
          <Link 
            to="/products" 
            className={styles['breadcrumb-link']}
            style={{ color: tokens.textSecondary }}
          >
            {t('layout.products')}
          </Link>
          <span 
            className={styles['breadcrumb-separator']}
            style={{ color: tokens.textMuted }}
          >
            /
          </span>
          <span 
            className={styles['breadcrumb-current']}
            style={{ color: tokens.textPrimary }}
          >
            {product.name}
          </span>
        </nav>

        {/* Main Product Content */}
        <div 
          className={styles['product-main-content']}
          style={{ 
            background: tokens.surface,
            borderColor: tokens.border,
            boxShadow: tokens.shadow 
          }}
        >
          {/* Image Gallery */}
          <div className={styles['product-gallery']}>
            <div 
              className={styles['main-image-container']}
              style={{ background: tokens.backgroundAccent }}
            >
              <img 
                src={selectedImage} 
                alt={product.name}
                className={styles['main-image']}
              />
              {!product.is_in_stock && (
                <div className={styles['out-of-stock-overlay']}>
                  <span>{t('products.out_of_stock')}</span>
                </div>
              )}
              {product.is_featured && (
                <div 
                  className={styles['featured-badge']}
                  style={{ 
                    background: tokens.warning,
                    boxShadow: `0 4px 12px ${tokens.warning}33` 
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('products.featured_badge')}
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className={styles['thumbnail-gallery']}>
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`${styles['thumbnail-button']} ${index === selectedImageIndex ? styles.active : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`View ${product.name} image ${index + 1}`}
                    style={{ 
                      borderColor: tokens.border,
                      background: tokens.backgroundAccent 
                    }}
                  >
                    <img 
                      src={image.presigned_url} 
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className={styles['thumbnail-image']}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className={styles['product-info']}>
            <div className={styles['product-header']}>
              <h1 
                className={styles['product-title']}
                style={{ color: tokens.textPrimary }}
              >
                {product.name}
              </h1>
              <div className={styles['product-meta']}>
                {product.seller?.id ? (
                  <Link 
                    to={`/seller/${product.seller.id}`} 
                    className={styles['product-seller']}
                    style={{ color: tokens.textSecondary }}
                  >
                    {t('products.detail.by')} {product.seller.username}
                  </Link>
                ) : (
                  <span 
                    className={styles['product-seller']}
                    style={{ color: tokens.textSecondary }}
                  >
                    {t('products.detail.by')} Designia
                  </span>
                )}
                {product.is_in_stock && (
                  <span 
                    className={`${styles['stock-status']} ${styles['in-stock']}`}
                    style={{ 
                      color: tokens.success,
                      background: `${tokens.success}1A` 
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('products.in_stock')}
                  </span>
                )}
                {!product.is_in_stock && (
                  <span 
                    className={`${styles['stock-status']} ${styles['out-of-stock']}`}
                    style={{ 
                      color: tokens.error,
                      background: `${tokens.error}1A` 
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.364 18.364A9 9 0 1 1 5.636 5.636a9 9 0 0 1 12.728 12.728zM12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('products.out_of_stock')}
                  </span>
                )}
              </div>
            </div>

            <div className={styles['product-price-section']}>
              <div className={styles['price-container']}>
                <span 
                  className={styles['price-amount']}
                  style={{ color: tokens.textPrimary }}
                >
                  ${product.price}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span 
                    className={styles['original-price']}
                    style={{ color: tokens.textMuted }}
                  >
                    ${product.original_price}
                  </span>
                )}
                {product.is_on_sale && (
                  <span 
                    className={styles['discount-badge']}
                    style={{ background: tokens.error }}
                  >
                    -{product.discount_percentage}%
                  </span>
                )}
              </div>
              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <div 
                  className={styles['low-stock-warning']}
                  style={{ 
                    color: tokens.warning,
                    background: `${tokens.warning}1A`,
                    borderColor: `${tokens.warning}4D` 
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('products.only_left_in_stock', { count: product.stock_quantity })}
                </div>
              )}
            </div>

            <div 
              className={styles['product-description']}
              style={{ 
                color: tokens.textSecondary,
                background: tokens.backgroundAccent,
                borderLeftColor: tokens.accent 
              }}
            >
              <p>{product.description}</p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className={styles['color-selection']}>
                <label 
                  className={styles['color-label']}
                  style={{ color: tokens.textSecondary }}
                >
                  {t('products.detail.select_color')}
                </label>
                <div className={styles['color-options']}>
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      className={`${styles['color-option']} ${selectedColor === color ? styles.selected : ''}`}
                      style={{ 
                        backgroundColor: color.toLowerCase(),
                        borderColor: tokens.border 
                      }}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      aria-label={t('products.detail.select_color_aria', { color })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Section */}
            <div 
              className={styles['product-actions']}
              style={{ 
                background: tokens.backgroundAccent,
                borderColor: tokens.border 
              }}
            >
              <div className={styles['quantity-selector']}>
                <label 
                  htmlFor="quantity" 
                  className={styles['quantity-label']}
                  style={{ color: tokens.textSecondary }}
                >
                  {t('products.detail.quantity')}
                </label>
                <div 
                  className={styles['quantity-controls']}
                  style={{ 
                    borderColor: tokens.border,
                    background: tokens.surface 
                  }}
                >
                  <button 
                    className={styles['quantity-btn']}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label={t('products.detail.decrease_qty')}
                    style={{ color: tokens.textSecondary }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <input 
                    id="quantity"
                    className={styles['quantity-input']} 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={product.stock_quantity}
                    aria-label={t('products.detail.qty_input_aria')}
                    style={{ color: tokens.textPrimary }}
                  />
                  <button 
                    className={styles['quantity-btn']}
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    aria-label={t('products.detail.increase_qty')}
                    style={{ color: tokens.textSecondary }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button 
                className={`${styles['add-to-cart-btn']} ${isAddingToCart ? styles.loading : ''} ${!product.is_in_stock ? styles.disabled : ''}`}
                onClick={handleAddToCart}
                disabled={!product.is_in_stock || isAddingToCart}
                style={{ 
                  background: tokens.buttonGradient,
                  color: tokens.accentContrast 
                }}
              >
                {isAddingToCart ? (
                  <>
                    <div className={styles.spinner}></div>
                    {t('products.detail.adding_to_cart')}
                  </>
                ) : product.is_in_stock ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('products.add_to_cart_button')}
                  </>
                ) : (
                  t('products.out_of_stock')
                )}
              </button>
            </div>

            {/* Quick Product Stats */}
            <div 
              className={styles['product-quick-stats']}
              style={{ 
                background: tokens.surface,
                borderColor: tokens.border 
              }}
            >
              <div 
                className={styles['stat-item']}
                style={{ color: tokens.textSecondary }}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: tokens.textMuted }}>
                  <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5C16.477 5 20.268 7.943 21.542 12C20.268 16.057 16.477 19 12 19C7.523 19 3.732 16.057 2.458 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{product.view_count} views</span>
              </div>
              <div 
                className={styles['stat-item']}
                style={{ color: tokens.textSecondary }}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: tokens.textMuted }}>
                  <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{product.favorite_count} favorites</span>
              </div>
              {product.average_rating > 0 && (
                <div 
                  className={styles['stat-item']}
                  style={{ color: tokens.textSecondary }}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: tokens.textMuted }}>
                    <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{product.average_rating.toFixed(1)} ({product.review_count} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Information Tabs (Details / Specifications / Seller) */}
        <div 
          className={styles['product-details-tabs']}
          style={{ 
            background: tokens.surface,
            borderColor: tokens.border,
            boxShadow: tokens.shadow 
          }}
        >
          <div 
            className={styles['tab-navigation']}
            style={{ background: tokens.backgroundAccent, borderColor: tokens.border }}
          >
            <button 
              className={`${styles['tab-button']} ${activeTab === 'details' ? styles.active : ''}`}
              onClick={() => setActiveTab('details')}
              style={{ 
                color: activeTab === 'details' ? tokens.accent : tokens.textSecondary,
                background: activeTab === 'details' ? tokens.surface : 'transparent'
              }}
            >
              Product Details
            </button>
            <button 
              className={`${styles['tab-button']} ${activeTab === 'specifications' ? styles.active : ''}`}
              onClick={() => setActiveTab('specifications')}
              style={{ 
                color: activeTab === 'specifications' ? tokens.accent : tokens.textSecondary,
                background: activeTab === 'specifications' ? tokens.surface : 'transparent'
              }}
            >
              Specifications
            </button>
            <button 
              className={`${styles['tab-button']} ${activeTab === 'seller' ? styles.active : ''}`}
              onClick={() => setActiveTab('seller')}
              style={{ 
                color: activeTab === 'seller' ? tokens.accent : tokens.textSecondary,
                background: activeTab === 'seller' ? tokens.surface : 'transparent'
              }}
            >
              Seller
            </button>
          </div>

          <div className={styles['tab-content']}>
            {activeTab === 'details' && (
              <div className={styles['details-content']}>
                <div className={styles['details-grid']}>
                  <div 
                    className={styles['detail-item']}
                    style={{ 
                      background: tokens.backgroundAccent,
                      borderColor: tokens.border 
                    }}
                  >
                    <span 
                      className={styles['detail-label']}
                      style={{ color: tokens.textMuted }}
                    >
                      Brand
                    </span>
                    <span 
                      className={styles['detail-value']}
                      style={{ color: tokens.textPrimary }}
                    >
                      {product.brand || 'N/A'}
                    </span>
                  </div>
                  <div 
                    className={styles['detail-item']}
                    style={{ 
                      background: tokens.backgroundAccent,
                      borderColor: tokens.border 
                    }}
                  >
                    <span 
                      className={styles['detail-label']}
                      style={{ color: tokens.textMuted }}
                    >
                      Model
                    </span>
                    <span 
                      className={styles['detail-value']}
                      style={{ color: tokens.textPrimary }}
                    >
                      {product.model || 'N/A'}
                    </span>
                  </div>
                  <div 
                    className={styles['detail-item']}
                    style={{ 
                      background: tokens.backgroundAccent,
                      borderColor: tokens.border 
                    }}
                  >
                    <span 
                      className={styles['detail-label']}
                      style={{ color: tokens.textMuted }}
                    >
                      Condition
                    </span>
                    <span 
                      className={styles['detail-value']}
                      style={{ color: tokens.textPrimary }}
                    >
                      {product.condition}
                    </span>
                  </div>
                  <div 
                    className={styles['detail-item']}
                    style={{ 
                      background: tokens.backgroundAccent,
                      borderColor: tokens.border 
                    }}
                  >
                    <span 
                      className={styles['detail-label']}
                      style={{ color: tokens.textMuted }}
                    >
                      Materials
                    </span>
                    <span 
                      className={styles['detail-value']}
                      style={{ color: tokens.textPrimary }}
                    >
                      {product.materials || 'N/A'}
                    </span>
                  </div>
                  <div 
                    className={styles['detail-item']}
                    style={{ 
                      background: tokens.backgroundAccent,
                      borderColor: tokens.border 
                    }}
                  >
                    <span 
                      className={styles['detail-label']}
                      style={{ color: tokens.textMuted }}
                    >
                      Category
                    </span>
                    <span 
                      className={styles['detail-value']}
                      style={{ color: tokens.textPrimary }}
                    >
                      {product.category?.name || 'N/A'}
                    </span>
                  </div>
                  <div 
                    className={styles['detail-item']}
                    style={{ 
                      background: tokens.backgroundAccent,
                      borderColor: tokens.border 
                    }}
                  >
                    <span 
                      className={styles['detail-label']}
                      style={{ color: tokens.textMuted }}
                    >
                      Tags
                    </span>
                    <span 
                      className={styles['detail-value']}
                      style={{ color: tokens.textPrimary }}
                    >
                      {product.tags && product.tags.length > 0 ? (
                        <div className={styles['tags-container']}>
                          {product.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className={styles.tag}
                              style={{ 
                                background: tokens.accent,
                                color: tokens.accentContrast 
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className={styles['specifications-content']}>
                <div className={styles['specifications-grid']}>
                  {product.weight && (
                    <div 
                      className={styles['spec-item']}
                      style={{ 
                        background: tokens.backgroundAccent,
                        borderColor: tokens.border 
                      }}
                    >
                      <span 
                        className={styles['spec-label']}
                        style={{ color: tokens.textSecondary }}
                      >
                        Weight
                      </span>
                      <span 
                        className={styles['spec-value']}
                        style={{ color: tokens.textPrimary }}
                      >
                        {product.weight} kg
                      </span>
                    </div>
                  )}
                  {product.dimensions_length && (
                    <div 
                      className={styles['spec-item']}
                      style={{ 
                        background: tokens.backgroundAccent,
                        borderColor: tokens.border 
                      }}
                    >
                      <span 
                        className={styles['spec-label']}
                        style={{ color: tokens.textSecondary }}
                      >
                        Length
                      </span>
                      <span 
                        className={styles['spec-value']}
                        style={{ color: tokens.textPrimary }}
                      >
                        {product.dimensions_length} cm
                      </span>
                    </div>
                  )}
                  {product.dimensions_width && (
                    <div 
                      className={styles['spec-item']}
                      style={{ 
                        background: tokens.backgroundAccent,
                        borderColor: tokens.border 
                      }}
                    >
                      <span 
                        className={styles['spec-label']}
                        style={{ color: tokens.textSecondary }}
                      >
                        Width
                      </span>
                      <span 
                        className={styles['spec-value']}
                        style={{ color: tokens.textPrimary }}
                      >
                        {product.dimensions_width} cm
                      </span>
                    </div>
                  )}
                  {product.dimensions_height && (
                    <div 
                      className={styles['spec-item']}
                      style={{ 
                        background: tokens.backgroundAccent,
                        borderColor: tokens.border 
                      }}
                    >
                      <span 
                        className={styles['spec-label']}
                        style={{ color: tokens.textSecondary }}
                      >
                        Height
                      </span>
                      <span 
                        className={styles['spec-value']}
                        style={{ color: tokens.textPrimary }}
                      >
                        {product.dimensions_height} cm
                      </span>
                    </div>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <div 
                      className={styles['spec-item']}
                      style={{ 
                        background: tokens.backgroundAccent,
                        borderColor: tokens.border 
                      }}
                    >
                      <span 
                        className={styles['spec-label']}
                        style={{ color: tokens.textSecondary }}
                      >
                        Available Colors
                      </span>
                      <span 
                        className={styles['spec-value']}
                        style={{ color: tokens.textPrimary }}
                      >
                        <div className={styles['colors-container']}>
                          {product.colors.map((color, index) => (
                            <span 
                              key={index} 
                              className={styles['color-chip']}
                              style={{ 
                                background: tokens.accent,
                                color: tokens.accentContrast 
                              }}
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'seller' && (
              <div className={styles['seller-tab-content']}>
                {product.seller && product.seller.id ? (
                  <>
                    <ViewSellerAccount 
                      seller={{
                        id: product.seller.id,
                        username: product.seller.username,
                        first_name: product.seller.first_name,
                        last_name: product.seller.last_name,
                        avatar: product.seller.profile?.profile_picture_url,
                        bio: product.seller.profile?.bio || 'Professional furniture designer with expertise in creating beautiful, functional pieces.',
                        location: product.seller.profile?.location || 'Location not specified',
                        website: product.seller.profile?.website,
                        job_title: product.seller.profile?.job_title,
                        company: product.seller.profile?.company,
                        instagram_url: product.seller.profile?.instagram_url,
                        twitter_url: product.seller.profile?.twitter_url,
                        linkedin_url: product.seller.profile?.linkedin_url,
                        facebook_url: product.seller.profile?.facebook_url,
                        is_verified_seller: product.seller.is_verified_seller || false,
                        seller_type: product.seller.profile?.seller_type,
                        created_at: product.seller.profile?.created_at || product.seller.profile?.updated_at
                      }}
                      showContactInfo={false}
                      showSocialMedia={false}
                      showProfessionalInfo={true}
                      className="compact-seller-view"
                    />
                  </>
                ) : (
                  <div 
                    className={styles['no-seller-info']}
                    style={{ color: tokens.textMuted }}
                  >
                    <p>Seller information not available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product Reviews Section */}
        {product.slug && (
          <div 
            className={styles['reviews-section']}
            style={{ 
              background: tokens.surface,
              borderColor: tokens.border,
              boxShadow: tokens.shadow 
            }}
          >
            <div 
              className={styles['reviews-header']}
              style={{ borderColor: tokens.border }}
            >
              <h2 
                className={styles['reviews-title']}
                style={{ color: tokens.textPrimary }}
              >
                {t('products.detail.customer_reviews')}
              </h2>
              {/* Simple summary header only */}
              <div className={styles['reviews-summary']}>
                <span 
                  className={styles['rating-text']}
                  style={{ color: tokens.textPrimary }}
                >
                  {product.average_rating > 0 ? `${product.average_rating.toFixed(1)} / 5` : t('products.detail.no_ratings_yet')}
                </span>
                <span 
                  className={styles['review-count']}
                  style={{ color: tokens.textSecondary }}
                >
                  {t('products.detail.reviews_count', { count: product.review_count, suffix: product.review_count !== 1 ? 's' : '' })}
                </span>
              </div>
            </div>
            <ProductReviews 
              productSlug={product.slug} 
              productId={product.id} 
              reviews={[]}
              variant="simple"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;

