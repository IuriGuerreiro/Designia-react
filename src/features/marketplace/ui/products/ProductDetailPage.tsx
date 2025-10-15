import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/app/layout';
import ProductReviews from './ProductReviews';
import { useCart } from '@/shared/state/CartContext';
import { useTranslation } from 'react-i18next';
import { productService } from '@/features/marketplace/api';
import { type Product } from '@/features/marketplace/model';
import ViewSellerAccount from '@/features/marketplace/ui/seller/ViewSellerAccount';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { t } = useTranslation();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specifications'>('details');

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      try {
        const data = await productService.getProduct(slug);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product.');
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
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="product-detail-page">
          {/* Breadcrumb Navigation Skeleton */}
          <nav className="breadcrumb-nav">
            <div className="skeleton-line" style={{ width: '80px', height: '16px' }}></div>
            <span className="breadcrumb-separator">/</span>
            <div className="skeleton-line" style={{ width: '120px', height: '16px' }}></div>
          </nav>

          {/* Main Product Content Skeleton */}
          <div className="product-skeleton">
            {/* Image Gallery Skeleton */}
            <div className="skeleton-gallery">
              <div className="skeleton-main-image"></div>
              <div className="skeleton-thumbnails">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="skeleton-thumbnail"></div>
                ))}
              </div>
            </div>

            {/* Product Information Skeleton */}
            <div className="skeleton-product-info">
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-description">
                <div className="skeleton-description-line"></div>
                <div className="skeleton-description-line"></div>
                <div className="skeleton-description-line"></div>
              </div>
              <div className="skeleton-actions"></div>
            </div>
          </div>

          {/* Product Details Tabs Skeleton */}
          <div className="skeleton-tabs">
            <div className="skeleton-tab-navigation"></div>
            <div className="skeleton-tab-content">
              <div className="skeleton-detail-item"></div>
              <div className="skeleton-detail-item"></div>
              <div className="skeleton-detail-item"></div>
              <div className="skeleton-detail-item"></div>
            </div>
          </div>

          {/* Reviews Section Skeleton */}
          <div className="reviews-section">
            <div className="reviews-header">
              <div className="skeleton-title" style={{ width: '200px', height: '32px' }}></div>
              <div className="skeleton-meta" style={{ width: '150px', height: '20px' }}></div>
            </div>
            <div className="reviews-content">
              {[1, 2, 3].map((index) => (
                <div key={index} className="review-skeleton">
                  <div className="skeleton-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-info">
                      <div className="skeleton-name"></div>
                      <div className="skeleton-meta">
                        <div className="skeleton-stars"></div>
                        <div className="skeleton-date"></div>
                      </div>
                    </div>
                  </div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-comment">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line short"></div>
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
        <div className="product-detail-error">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Product Not Found</h3>
          <p>{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <Link to="/products" className="back-to-products-btn">
            Browse Products
          </Link>
        </div>
      </Layout>
    );
  }

  const selectedImage = product.images?.[selectedImageIndex]?.presigned_url || '/placeholder-product.png';

  return (
    <Layout>
      <div className="product-detail-page">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav">
          <Link to="/products" className="breadcrumb-link">Products</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Main Product Content */}
        <div className="product-main-content">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-container">
              <img 
                src={selectedImage} 
                alt={product.name}
                className="main-image"
              />
              {!product.is_in_stock && (
                <div className="out-of-stock-overlay">
                  <span>Out of Stock</span>
                </div>
              )}
              {product.is_featured && (
                <div className="featured-badge">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Featured
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-gallery">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`thumbnail-button ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`View ${product.name} image ${index + 1}`}
                  >
                    <img 
                      src={image.presigned_url} 
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="thumbnail-image"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-meta">
                {product.seller?.id ? (
                  <Link to={`/seller/${product.seller.id}`} className="product-seller">
                    By {product.seller.username}
                  </Link>
                ) : (
                  <span className="product-seller">
                    By Designia
                  </span>
                )}
                {product.is_in_stock && (
                  <span className="stock-status in-stock">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    In Stock
                  </span>
                )}
                {!product.is_in_stock && (
                  <span className="stock-status out-of-stock">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.364 18.364A9 9 0 1 1 5.636 5.636a9 9 0 0 1 12.728 12.728zM12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <div className="product-price-section">
              <div className="price-container">
                <span className="price-amount">${product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="original-price">${product.original_price}</span>
                )}
                {product.is_on_sale && (
                  <span className="discount-badge">
                    -{product.discount_percentage}%
                  </span>
                )}
              </div>
              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <div className="low-stock-warning">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Only {product.stock_quantity} left in stock
                </div>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="color-selection">
                <label className="color-label">Select Color</label>
                <div className="color-options">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Section */}
            <div className="product-actions">
              <div className="quantity-selector">
                <label htmlFor="quantity" className="quantity-label">Quantity</label>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <path d="M5 12H19" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <input 
                    id="quantity"
                    className="quantity-input" 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={product.stock_quantity}
                    aria-label="Product quantity"
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    aria-label="Increase quantity"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <path d="M12 5V19M5 12H19" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button 
                className={`add-to-cart-btn ${isAddingToCart ? 'loading' : ''} ${!product.is_in_stock ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.is_in_stock || isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <div className="spinner"></div>
                    Adding...
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
            <div className="product-quick-stats">
              <div className="stat-item">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5C16.477 5 20.268 7.943 21.542 12C20.268 16.057 16.477 19 12 19C7.523 19 3.732 16.057 2.458 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{product.view_count} views</span>
              </div>
              <div className="stat-item">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{product.favorite_count} favorites</span>
              </div>
              {product.average_rating > 0 && (
                <div className="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{product.average_rating.toFixed(1)} ({product.review_count} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details-tabs">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Product Details
            </button>
            <button 
              className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'details' && (
              <div className="details-content">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Brand</span>
                    <span className="detail-value">{product.brand || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Model</span>
                    <span className="detail-value">{product.model || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Condition</span>
                    <span className="detail-value">{product.condition}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Materials</span>
                    <span className="detail-value">{product.materials || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{product.category?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tags</span>
                    <span className="detail-value">
                      {product.tags && product.tags.length > 0 ? (
                        <div className="tags-container">
                          {product.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      ) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="specifications-content">
                <div className="specifications-grid">
                  {product.weight && (
                    <div className="spec-item">
                      <span className="spec-label">Weight</span>
                      <span className="spec-value">{product.weight} kg</span>
                    </div>
                  )}
                  {product.dimensions_length && (
                    <div className="spec-item">
                      <span className="spec-label">Length</span>
                      <span className="spec-value">{product.dimensions_length} cm</span>
                    </div>
                  )}
                  {product.dimensions_width && (
                    <div className="spec-item">
                      <span className="spec-label">Width</span>
                      <span className="spec-value">{product.dimensions_width} cm</span>
                    </div>
                  )}
                  {product.dimensions_height && (
                    <div className="spec-item">
                      <span className="spec-label">Height</span>
                      <span className="spec-value">{product.dimensions_height} cm</span>
                    </div>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <div className="spec-item">
                      <span className="spec-label">Available Colors</span>
                      <span className="spec-value">
                        <div className="colors-container">
                          {product.colors.map((color, index) => (
                            <span key={index} className="color-chip">{color}</span>
                          ))}
                        </div>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seller Profile Section */}
        {product.seller && product.seller.id ? (
          <div className="seller-profile-section">
            <div className="section-header">
              <h2 className="section-title">About the Seller</h2>
              <Link 
                to={`/seller/${product.seller.id}`} 
                className="view-full-profile-btn"
                aria-label={`View full profile of ${product.seller.first_name || product.seller.username}`}
              >
                View Full Profile
              </Link>
            </div>
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
          </div>
        ) : (
          <div className="seller-profile-section">
            <div className="section-header">
              <h2 className="section-title">About the Seller</h2>
            </div>
            <div className="no-seller-info">
              <p>Seller information not available</p>
            </div>
          </div>
        )}
        
        {/* Product Reviews Section */}
        {product.slug && (
          <div className="reviews-section">
            <div className="reviews-header">
              <h2 className="reviews-title">Customer Reviews</h2>
              <div className="reviews-summary">
                {product.average_rating > 0 ? (
                  <div className="rating-display">
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          viewBox="0 0 24 24" 
                          fill={star <= product.average_rating ? "currentColor" : "none"}
                          className={`star ${star <= product.average_rating ? 'filled' : 'empty'}`}
                        >
                          <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ))}
                    </div>
                    <span className="rating-text">
                      {product.average_rating.toFixed(1)} out of 5
                    </span>
                    <span className="review-count">
                      Based on {product.review_count} review{product.review_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ) : (
                  <div className="no-reviews">
                    <span>No reviews yet</span>
                  </div>
                )}
              </div>
            </div>
            <ProductReviews 
              productSlug={product.slug} 
              productId={product.id} 
              reviews={[]} // Reviews will be loaded by the ProductReviews component
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
