import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useTranslation } from 'react-i18next';
import { productService } from '../../../services';
import { type ProductListItem } from '../../../types/marketplace';
import ProductCard from './ProductCard';
import './MyProducts.css';

const MyProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Load user's products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const userProducts = await productService.getMyProducts();
        console.log('User products loaded:', userProducts);
        setProducts(userProducts);
      } catch (err) {
        console.error('Failed to load user products:', err);
        setError('Failed to load your products. Please check your connection and try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleDelete = async (productId: string, productSlug: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.deleteProduct(productSlug);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Product filtering logic
  const activeProducts = products.filter(p => p.is_active).length;
  const inactiveProducts = products.filter(p => !p.is_active).length;
  const featuredProducts = products.filter(p => p.is_featured).length;
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;

  // Filter products based on active filter
  const getFilteredProducts = () => {
    switch (activeFilter) {
      case 'active':
        return products.filter(p => p.is_active);
      case 'inactive':
        return products.filter(p => !p.is_active);
      case 'featured':
        return products.filter(p => p.is_featured);
      case 'lowStock':
        return products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
      case 'outOfStock':
        return products.filter(p => p.stock_quantity === 0);
      default:
        return products;
    }
  };

  const filteredProducts = getFilteredProducts();

  if (loading) {
    return (
      <Layout maxWidth="full">
        <div className="my-products-page">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Hero Section Skeleton */}
            <div className="hero-section skeleton">
              <div className="hero-title skeleton-text"></div>
              <div className="hero-subtitle skeleton-text"></div>
            </div>

            {/* Products Overview Box Skeleton */}
            <div className="products-overview-box skeleton">
              <div className="overview-header skeleton">
                <div className="overview-title skeleton-text"></div>
                <div className="overview-actions skeleton">
                  <div className="add-product-btn skeleton-button"></div>

                </div>
              </div>
              
              <div className="overview-stats skeleton">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="stat-item skeleton">
                    <div className="stat-number skeleton-text"></div>
                    <div className="stat-label skeleton-text"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="products-section skeleton">
              <div className="products-header skeleton">
                <div className="section-title skeleton-text"></div>
                <div className="products-summary skeleton-text"></div>
              </div>
              
              <div className="products-grid skeleton">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="product-card-skeleton">
                    <div className="product-image skeleton-image"></div>
                    <div className="product-info skeleton">
                      <div className="product-name skeleton-text"></div>
                      <div className="product-price skeleton-text"></div>
                      <div className="product-actions skeleton">
                        <div className="action-btn skeleton-button"></div>
                        <div className="action-btn skeleton-button"></div>
                        <div className="action-btn skeleton-button"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="full">
      <div className="my-products-page">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Hero Section - Like MyOrdersPage.tsx */}
          <div className="hero-section">
            <h1 className="hero-title">{t('products.my_products_title')}</h1>
            <p className="hero-subtitle">Manage your product portfolio with powerful tools and insights</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <div className="error-content">
                <div className="error-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div className="error-text">
                  <h4>Failed to Load Products</h4>
                  <p>{error}</p>
                </div>
                <button className="retry-btn" onClick={() => window.location.reload()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4V10H7M23 20V14H17"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14"/>
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="products-overview-box">
            <div className="overview-header">
              <h2 className="overview-title">Product Overview</h2>
              <div className="overview-actions">
                <Link to="/products/new" className="add-product-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5V19M5 12H19"/>
                  </svg>
                  Add New Product
                </Link>
              </div>
            </div>
            
            <div className="overview-stats">
              <div 
                className={`stat-item ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <span className="stat-number">{products.length}</span>
                <span className="stat-label">Total Products</span>
              </div>
              <div 
                className={`stat-item ${activeFilter === 'active' ? 'active' : ''}`}
                onClick={() => setActiveFilter('active')}
              >
                <span className="stat-number">{activeProducts}</span>
                <span className="stat-label">Active</span>
              </div>
              <div 
                className={`stat-item ${activeFilter === 'lowStock' ? 'active' : ''}`}
                onClick={() => setActiveFilter('lowStock')}
              >
                <span className="stat-number">{lowStockProducts}</span>
                <span className="stat-label">Low Stock</span>
              </div>
              <div 
                className={`stat-item ${activeFilter === 'outOfStock' ? 'active' : ''}`}
                onClick={() => setActiveFilter('outOfStock')}
              >
                <span className="stat-number">{outOfStockProducts}</span>
                <span className="stat-label">Out of Stock</span>
              </div>
              <div 
                className={`stat-item ${activeFilter === 'featured' ? 'active' : ''}`}
                onClick={() => setActiveFilter('featured')}
              >
                <span className="stat-number">{featuredProducts}</span>
                <span className="stat-label">Featured</span>
              </div>
              <div 
                className={`stat-item ${activeFilter === 'inactive' ? 'active' : ''}`}
                onClick={() => setActiveFilter('inactive')}
              >
                <span className="stat-number">{inactiveProducts}</span>
                <span className="stat-label">Inactive</span>
              </div>
            </div>
          </div>
        </div>
        {/* Products Content */}
        {filteredProducts.length > 0 ? (
          <div className="my-products-content">
            {/* Products Grid/List */}
            <div className="products-section">
              <div className="products-header">
                <h3 className="section-title">
                  {activeFilter === 'all' ? 'Your Products' : 
                   activeFilter === 'active' ? 'Active Products' :
                   activeFilter === 'inactive' ? 'Inactive Products' :
                   activeFilter === 'featured' ? 'Featured Products' :
                   activeFilter === 'lowStock' ? 'Low Stock Products' :
                   'Out of Stock Products'}
                </h3>
                <div className="products-summary">
                  <span className="summary-text">
                    Showing {filteredProducts.length} of {products.length} product{filteredProducts.length !== 1 ? 's' : ''}
                    {activeFilter !== 'all' && (
                      <span className="filter-indicator">
                        {' '}({activeFilter === 'active' ? 'Active' : 
                              activeFilter === 'inactive' ? 'Inactive' : 
                              activeFilter === 'featured' ? 'Featured' : 
                              activeFilter === 'lowStock' ? 'Low Stock' : 
                              'Out of Stock'} filter)
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="products-layout products-grid">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    displayMode="owner"
                    onAddToCart={() => {}} // Empty function for owner mode
                    onFavoriteToggle={() => {}} // Empty function for owner mode
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <div className="empty-icon">
                {activeFilter === 'all' ? (
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 7L10 17L5 12"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                  </svg>
                ) : (
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"/>
                  </svg>
                )}
              </div>
              <h3 className="empty-title">
                {activeFilter === 'all' ? 'No Products Yet' : 'No Products Found'}
              </h3>
              <p className="empty-description">
                {activeFilter === 'all' 
                  ? 'Start building your product portfolio by adding your first item'
                  : `No products match the "${activeFilter === 'active' ? 'Active' : 
                                                      activeFilter === 'inactive' ? 'Inactive' : 
                                                      activeFilter === 'featured' ? 'Featured' : 
                                                      activeFilter === 'lowStock' ? 'Low Stock' : 
                                                      'Out of Stock'}" filter`
                }
              </p>
              <div className="empty-actions">
                {activeFilter === 'all' ? (
                  <>
                    <Link to="/products/new" className="empty-btn primary">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5V19M5 12H19"/>
                      </svg>
                      Add Your First Product
                    </Link>
                    <Link to="/products" className="empty-btn secondary">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3V21H21"/>
                        <path d="M9 9L12 6L16 10L20 6"/>
                      </svg>
                      Browse Marketplace
                    </Link>
                  </>
                ) : (
                  <button 
                    className="empty-btn primary"
                    onClick={() => setActiveFilter('all')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3V21H21"/>
                      <path d="M9 9L12 6L16 10L20 6"/>
                    </svg>
                    Show All Products
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProductsPage;