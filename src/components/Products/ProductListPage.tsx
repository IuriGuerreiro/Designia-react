import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import ProductCard from './ProductCard';
import './Products.css';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import { productService, categoryService, cartService } from '../../services';
import { type ProductListItem, type Category, type ProductFilters } from '../../types/marketplace';


const ServicesPlaceholder: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="services-placeholder">
      <h3>{t('products.services_title')}</h3>
      <p>{t('products.services_description')}</p>
    </div>
  );
};

const ProductListPage: React.FC = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    page: 1,
    page_size: 20,
  });
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load from API only
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getProducts(filters),
          categoryService.getCategories()
        ]);
        
        setProducts(productsResponse.results || productsResponse);
        setCategories(categoriesResponse);
      } catch (err) {
        console.error('Failed to load data from API:', err);
        setError('Failed to load products from server. Please check your connection and try again.');
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // Update search filter when searchTerm changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filter products based on search term (additional client-side filtering)
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = async (product: ProductListItem) => {
    try {
      // Use API to add to cart
      await cartService.addItem(product.id, 1);
      
      // Also add to local cart context for immediate UI feedback
      addToCart({ 
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        quantity: 1,
        slug: product.slug,
        imageUrl: product.primary_image?.image || '/placeholder-product.png'
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Still add to local cart for UI feedback
      addToCart({ 
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        quantity: 1,
        slug: product.slug,
        imageUrl: product.primary_image?.image || '/placeholder-product.png'
      });
    }
  };

  const handleFavoriteToggle = (productId: string, favorited: boolean) => {
    // Update the product's favorite status in the local state
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, is_favorited: favorited }
          : product
      )
    );
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };


  return (
    <Layout>
      <div className="products-page">
        <div className="products-header">
          <h2>{t('products.collection_title')}</h2>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder={t('products.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories filter (only show if we have categories from API) */}
        {categories.length > 0 && (
          <div className="categories-filter">
            <button 
              className={!filters.category ? 'active' : ''}
              onClick={() => handleFilterChange({ category: undefined })}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={filters.category === category.slug ? 'active' : ''}
                onClick={() => handleFilterChange({ category: category.slug })}
              >
                {category.name} ({category.product_count})
              </button>
            ))}
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`} 
            onClick={() => setActiveTab('products')}
          >
            {t('products.products_tab')}
          </button>
          <button 
            className={`tab ${activeTab === 'services' ? 'active' : ''}`} 
            onClick={() => setActiveTab('services')}
          >
            {t('products.services_tab')}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              {t('common.retry')}
            </button>
          </div>
        )}

        {activeTab === 'products' ? (
          <>
            {loading ? (
              <div className="loading-message">
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map(product => (
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
                <p>{t('products.no_search_results', { searchTerm })}</p>
              </div>
            )}
          </>
        ) : (
          <ServicesPlaceholder />
        )}
      </div>
    </Layout>
  );
};

export default ProductListPage;