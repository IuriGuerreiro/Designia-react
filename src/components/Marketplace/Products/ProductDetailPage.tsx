import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import Reviews from '../Reviews/Reviews';
import { useCart } from '../../../contexts/CartContext';
import { useTranslation } from 'react-i18next';
import { productService, favoriteService, cartService } from '../../../services';
import { type Product } from '../../../types/marketplace';
import './Products.css';


const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) {
        console.log('No slug provided');
        setError('Product not found');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading product from API...', slug);
        const productData = await productService.getProduct(slug);
        console.log('Product loaded successfully:', productData?.name);
        
        setProduct(productData);
        setIsFavorited(productData.is_favorited);
      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Failed to load product. Please check your connection and try again.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    console.log('=== PRODUCT DETAIL - ADD TO CART ===');
    console.log('Product:', {
      id: product.id,
      idType: typeof product.id,
      name: product.name,
      price: product.price,
      priceType: typeof product.price,
      quantity: quantity,
      quantityType: typeof quantity,
      isInStock: product.is_in_stock,
      stockQuantity: product.stock_quantity,
    });
    
    setIsAddingToCart(true);
    try {
      // Only use the cart context method - it handles both local and server sync
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        quantity: quantity,
        slug: product.slug,
        imageUrl: (() => {
          const firstImage = productImages[0];
          if (!firstImage) return '/placeholder-product.png';
          
          if (firstImage.presigned_url && firstImage.presigned_url !== 'null' && firstImage.presigned_url !== null) {
            return firstImage.presigned_url;
          } else if (firstImage.image_url && firstImage.image_url !== 'null' && firstImage.image_url !== null) {
            return firstImage.image_url;
          } else if (firstImage.image && firstImage.image !== 'null' && firstImage.image !== null) {
            return firstImage.image;
          }
          return '/placeholder-product.png';
        })(),
        availableStock: product.stock_quantity,
        isActive: product.is_in_stock
      });
      
      // Reset quantity after adding
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(`Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!product) return;
    
    try {
      const response = await favoriteService.toggleFavorite(product.slug);
      setIsFavorited(response.favorited);
      
      // Show user feedback
      if (response.favorited) {
        console.log('Product added to favorites');
        // You can add a toast notification here
      } else {
        console.log('Product removed from favorites');
        // You can add a toast notification here
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      
      // Handle authentication error
      if (error instanceof Error && error.message.includes('401')) {
        alert('Please log in to add products to favorites');
        navigate('/login');
      } else {
        alert('Failed to update favorites. Please try again.');
      }
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };


  if (loading) {
    return (
      <Layout>
        <div className="product-detail-page">
          <div className="loading-message">
            <p>Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !product) {
    return (
      <Layout>
        <div className="product-detail-page">
          <div className="error-message">
            <h2>Product Not Found</h2>
            <p>{error}</p>
            <Link to="/products" className="btn btn-primary">
              Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return null;
  }

  // Handle product data format with presigned URLs
  const productImages = product.images || [];
  
  // Get the selected image with presigned URL priority
  const selectedImage = productImages[selectedImageIndex] || productImages[0];
  
  let primaryImage = '/placeholder-product.png';
  
  if (selectedImage) {
    if (selectedImage.presigned_url && selectedImage.presigned_url !== 'null' && selectedImage.presigned_url !== null) {
      primaryImage = selectedImage.presigned_url;
    } else if (selectedImage.image_url && selectedImage.image_url !== 'null' && selectedImage.image_url !== null) {
      primaryImage = selectedImage.image_url;
    } else if (selectedImage.image && selectedImage.image !== 'null' && selectedImage.image !== null) {
      primaryImage = selectedImage.image;
    }
  }
  
  console.log('=== PRODUCT DETAIL IMAGE DEBUG ===');
  console.log('Product name:', product.name);
  console.log('Product ID:', product.id);
  console.log('Selected image index:', selectedImageIndex);
  console.log('Selected image data:', selectedImage);
  console.log('Total images:', productImages.length);
  
  if (selectedImage) {
    console.log('Selected image fields:');
    console.log('  - id:', selectedImage.id);
    console.log('  - image:', selectedImage.image);
    console.log('  - presigned_url:', selectedImage.presigned_url);
    console.log('  - image_url:', selectedImage.image_url);
    console.log('  - s3_key:', selectedImage.s3_key);
    console.log('  - is_primary:', selectedImage.is_primary);
    console.log('  - order:', selectedImage.order);
    
    if (selectedImage.presigned_url) {
      console.log('✅ Using presigned URL:', selectedImage.presigned_url);
    } else if (selectedImage.image_url) {
      console.log('⚠️  Using image_url fallback:', selectedImage.image_url);
    } else if (selectedImage.image) {
      console.log('⚠️  Using image fallback:', selectedImage.image);
    } else {
      console.log('❌ No image URLs found, using placeholder');
    }
  } else {
    console.log('❌ No selected image data found');
  }
  
  console.log('Final primary image URL:', primaryImage);
  console.log('All product images:', productImages);

  const displayPrice = product.price.toString();
  const originalPrice = product.original_price?.toString();
  const isOnSale = product.is_on_sale || false;
  const discountPercentage = product.discount_percentage || 0;
  const isInStock = product.is_in_stock;
  const stockQuantity = product.stock_quantity || 0;
  const condition = product.condition || 'new';
  const brand = product.brand || '';
  const model = product.model || '';
  const colors = product.colors || [];
  const materials = product.materials || '';
  const tags = product.tags || [];
  const seller = product.seller || { username: 'Unknown' };
  const category = product.category || { name: 'Uncategorized' };
  const averageRating = product.average_rating || 0;
  const reviewCount = product.review_count || 0;
  const weight = product.weight;
  const dimensions = {
    length: product.dimensions_length,
    width: product.dimensions_width, 
    height: product.dimensions_height
  };

  return (
    <Layout>
      <div className="product-detail-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/products">Products</Link>
          <span> / </span>
          <Link to={`/products?category=${category.name}`}>{category.name}</Link>
          <span> / </span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-main">
          {/* Product Images */}
          <div className="product-detail-images">
            <div className="main-image-container">
              <img 
                src={primaryImage} 
                alt={productImages[selectedImageIndex]?.alt_text || product.name} 
                className="main-product-image" 
              />
              
              {/* Sale badge */}
              {isOnSale && (
                <div className="sale-badge">
                  -{discountPercentage}%
                </div>
              )}

              {/* Favorite button */}
              <button 
                className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={handleFavoriteToggle}
                aria-label={isFavorited ? t('products.remove_from_favorites') : t('products.add_to_favorites')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={isFavorited ? "#ff4757" : "none"}
                    stroke={isFavorited ? "#ff4757" : "#999"}
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>

            {/* Image thumbnails */}
            {productImages.length > 1 && (
              <div className="image-thumbnails">
                {productImages.map((image, index) => {
                  let thumbnailUrl = '/placeholder-product.png';
                  
                  if (image.presigned_url && image.presigned_url !== 'null' && image.presigned_url !== null) {
                    thumbnailUrl = image.presigned_url;
                  } else if (image.image_url && image.image_url !== 'null' && image.image_url !== null) {
                    thumbnailUrl = image.image_url;
                  } else if (image.image && image.image !== 'null' && image.image !== null) {
                    thumbnailUrl = image.image;
                  }
                  
                  return (
                    <button
                      key={index}
                      className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                      onClick={() => handleImageSelect(index)}
                    >
                      <img src={thumbnailUrl} alt={image.alt_text || `${product.name} ${index + 1}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <div className="product-header">
              <h1>{product.name}</h1>
              
              {/* Rating */}
              {averageRating > 0 && (
                <div className="product-rating">
                  <div className="rating-stars">
                    {'★'.repeat(Math.floor(averageRating))}
                    {'☆'.repeat(5 - Math.floor(averageRating))}
                  </div>
                  <span className="rating-text">
                    {averageRating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="product-pricing">
              <div className="price-container">
                <span className="current-price">${displayPrice}</span>
                {originalPrice && isOnSale && (
                  <span className="original-price">${originalPrice}</span>
                )}
              </div>
              {isOnSale && (
                <span className="savings">
                  Save ${(parseFloat(originalPrice || '0') - parseFloat(displayPrice)).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="product-details">
              <div className="detail-section">
                <h4>Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Category:</span>
                    <span className="value">{category.name}</span>
                  </div>
                  
                  {brand && (
                    <div className="detail-item">
                      <span className="label">Brand:</span>
                      <span className="value">{brand}</span>
                    </div>
                  )}
                  
                  {model && (
                    <div className="detail-item">
                      <span className="label">Model:</span>
                      <span className="value">{model}</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <span className="label">Condition:</span>
                    <span className="value condition-badge">{condition}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Seller:</span>
                    <span className="value">{seller.username}</span>
                  </div>
                </div>
              </div>

              {/* Colors */}
              {colors.length > 0 && (
                <div className="detail-section">
                  <h4>Available Colors</h4>
                  <div className="color-options">
                    {colors.map((color, index) => (
                      <span 
                        key={index}
                        className="color-option"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {materials && (
                <div className="detail-section">
                  <h4>Materials</h4>
                  <p>{materials}</p>
                </div>
              )}

              {/* Dimensions */}
              {(dimensions.length || dimensions.width || dimensions.height || weight) && (
                <div className="detail-section">
                  <h4>Dimensions & Weight</h4>
                  <div className="dimensions-grid">
                    {dimensions.length && (
                      <div className="dimension-item">
                        <span className="label">Length:</span>
                        <span className="value">{dimensions.length} cm</span>
                      </div>
                    )}
                    {dimensions.width && (
                      <div className="dimension-item">
                        <span className="label">Width:</span>
                        <span className="value">{dimensions.width} cm</span>
                      </div>
                    )}
                    {dimensions.height && (
                      <div className="dimension-item">
                        <span className="label">Height:</span>
                        <span className="value">{dimensions.height} cm</span>
                      </div>
                    )}
                    {weight && (
                      <div className="dimension-item">
                        <span className="label">Weight:</span>
                        <span className="value">{weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="detail-section">
                  <h4>Tags</h4>
                  <div className="tags-container">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Section */}
            <div className="add-to-cart-section">
              <div className="stock-info">
                {isInStock ? (
                  <span className="in-stock">
                    ✓ In Stock ({stockQuantity} available)
                  </span>
                ) : (
                  <span className="out-of-stock">
                    ✗ Out of Stock
                  </span>
                )}
              </div>

              {isInStock && (
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      id="quantity"
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, Math.min(stockQuantity, parseInt(e.target.value) || 1)))}
                      min="1"
                      max={stockQuantity}
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                      disabled={quantity >= stockQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button 
                className="btn btn-primary add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!isInStock || isAddingToCart}
              >
                {isAddingToCart 
                  ? 'Adding to Cart...' 
                  : isInStock 
                    ? `Add ${quantity} to Cart` 
                    : 'Out of Stock'
                }
              </button>

              <div className="shipping-info">
                <p>🚚 {t('products.shipping_info')}</p>
                <p>📦 Ships within 2-3 business days</p>
                <p>↩️ 30-day return policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="product-reviews-section">
          <Reviews 
            productSlug={product.slug}
            productId={product.id}
            initialReviews={product.reviews || []}
            showAverageRating={true}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;