import React, { useState, useEffect, useMemo } from 'react';
import './ProductList.css';
import Layout from '../../Layout/Layout';
import ProductCard from './ProductCard';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../../shared/state/CartContext';
import { categoryService, productService } from '../../../features/marketplace/api';
import { type ProductListItem, type ProductFilters } from '../../../types/marketplace';

// Skeleton Loading Component
const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-price"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

// Filter Component
const ProductFilters: React.FC<{
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  categories: any[];
}> = ({ filters, onFilterChange, categories }) => {
  const { t } = useTranslation();

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value, page: 1 }); // Reset to first page
  };

  const clearFilters = () => {
    onFilterChange({ page: 1 });
  };

  return (
    <div className="product-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <button onClick={clearFilters} className="clear-filters-btn">
          Clear All
        </button>
      </div>
      
      <div className="filter-section">
        <label>Price Range</label>
        <div className="price-range">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price || ''}
            onChange={(e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
            className="price-input"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price || ''}
            onChange={(e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
            className="price-input"
          />
        </div>
      </div>

      <div className="filter-section">
        <label>Category</label>
        <select
          value={filters.category_slug || ''}
          onChange={(e) => handleFilterChange('category_slug', e.target.value || undefined)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label>Condition</label>
        <div className="checkbox-group">
          {['new', 'like_new', 'good', 'fair', 'poor'].map(condition => (
            <label key={condition} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.condition?.includes(condition) || false}
                onChange={(e) => {
                  const currentConditions = filters.condition || [];
                  const newConditions = e.target.checked
                    ? [...currentConditions, condition]
                    : currentConditions.filter(c => c !== condition);
                  handleFilterChange('condition', newConditions.length > 0 ? newConditions : undefined);
                }}
              />
              <span>{condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label>Availability</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.in_stock || false}
              onChange={(e) => handleFilterChange('in_stock', e.target.checked || undefined)}
            />
            <span>In Stock Only</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.is_featured || false}
              onChange={(e) => handleFilterChange('is_featured', e.target.checked || undefined)}
            />
            <span>Featured Products</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.is_on_sale || false}
              onChange={(e) => handleFilterChange('is_on_sale', e.target.checked || undefined)}
            />
            <span>On Sale</span>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <label>Rating</label>
        <select
          value={filters.min_rating || ''}
          onChange={(e) => handleFilterChange('min_rating', e.target.value ? Number(e.target.value) : undefined)}
          className="filter-select"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
      </div>
    </div>
  );
};

// Sort Component
const ProductSort: React.FC<{
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}> = ({ sortBy, onSortChange }) => {
  return (
    <div className="product-sort">
      <label>Sort by:</label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="sort-select"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="price_low">Price: Low to High</option>
        <option value="price_high">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
        <option value="popular">Most Popular</option>
        <option value="name">Name A-Z</option>
      </select>
    </div>
  );
};

const ServicesPlaceholder: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="services-placeholder">
      <h3>{t('products.services_title')}</h3>
      <p>{t('products.services_description')}</p>
    </div>
  );
};

const ProductList: React.FC = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  
  // State for API data
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for UI
  const [activeTab, setActiveTab] = useState('products');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // State for filters
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    page_size: 20
  });

  // Load products and categories from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getProducts(filters),
          categoryService.getCategories()
        ]);
        
        // Handle both paginated and direct array responses
        const apiProducts = productsResponse.results || productsResponse;
        // Ensure apiProducts is an array
        setProducts(Array.isArray(apiProducts) ? apiProducts : []);
        setCategories(categoriesResponse);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load products. Please check your connection and try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // Sort and filter products
  const processedProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        product.short_description.toLowerCase().includes(filters.search!.toLowerCase()) ||
        product.brand.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => b.view_count - a.view_count);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'newest':
      default:
        filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [products, sortBy, filters.search]);

  const handleAddToCart = async (product: any) => {
    // Use presigned URL from primary image, fallback to regular image, then placeholder
    let imageUrl = '/placeholder-product.png';
    
    if (product.primary_image) {
      if (product.primary_image.presigned_url && product.primary_image.presigned_url !== 'null' && product.primary_image.presigned_url !== null) {
        imageUrl = product.primary_image.presigned_url;
      } else if (product.primary_image.image_url && product.primary_image.image_url !== 'null' && product.primary_image.image_url !== null) {
        imageUrl = product.primary_image.image_url;
      } else if (product.primary_image.image && product.primary_image.image !== 'null' && product.primary_image.image !== null) {
        imageUrl = product.primary_image.image;
      }
    } else if (product.imageUrl) {
      imageUrl = product.imageUrl;
    }
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? product.price : product.price.toString(),
      imageUrl: imageUrl,
      quantity: 1,
      availableStock: product.stock_quantity,
      isActive: product.is_in_stock
    };
    
    try {
      await addToCart(cartItem);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(`Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFavoriteToggle = (productId: string, favorited: boolean) => {
    // Update the local state to reflect the favorite change
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, is_favorited: favorited }
          : product
      )
    );
  };

  // Render loading skeleton
  const renderLoadingSkeletons = () => {
    return (
      <div className="products-flex">
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  };

  return (
    <Layout padding="default" maxWidth="full">
      <div className="products-page">
        <div className="products-header">
          <h2>{t('products.collection_title')}</h2>
          <div className="header-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder={t('products.search_placeholder')}
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                disabled={loading}
              />
            </div>
            <div className="header-buttons">
              <button
                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4H21V6.172L13.172 14H10.828L3 6.172V4ZM3 18V20H21V18L13.172 10H10.828L3 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Filters
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`} 
            onClick={() => setActiveTab('products')}
            disabled={loading}
          >
            {t('products.products_tab')}
          </button>
          <button 
            className={`tab ${activeTab === 'services' ? 'active' : ''}`} 
            onClick={() => setActiveTab('services')}
            disabled={loading}
          >
            {t('products.services_tab')}
          </button>
        </div>

        {activeTab === 'products' && (
          <>
            <div className="products-controls">
              <div className="results-info">
                <span>{processedProducts.length} product{processedProducts.length !== 1 ? 's' : ''} found</span>
              </div>
              <ProductSort sortBy={sortBy} onSortChange={setSortBy} />
            </div>

            <div className="products-content">
              {showFilters && (
                <ProductFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  categories={categories}
                />
              )}
              
              <div className="products-main">
                {loading ? (
                  renderLoadingSkeletons()
                ) : processedProducts.length > 0 ? (
                  <div className="products-flex">
                    {processedProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={() => handleAddToCart(product)} 
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="no-results-message">
                    <div className="no-results-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>No products found</h3>
                    <p>{filters.search ? `No products match "${filters.search}"` : 'No products are currently available.'}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'services' && <ServicesPlaceholder />}
      </div>
    </Layout>
  );
};

export default ProductList;
