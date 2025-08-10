import React, { useState, useEffect } from 'react';
import Layout from '../../Layout/Layout';
import ProductCard from './ProductCard';
import './Products.css';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../../contexts/CartContext';
import { productService } from '../../../services';
import { type ProductListItem } from '../../../types/marketplace';


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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  
  // State for API data
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await productService.getProducts();
        // Handle both paginated and direct array responses
        const apiProducts = response.results || response;
        setProducts(apiProducts);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please check your connection and try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = async (product: any) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? product.price : product.price.toString(),
      imageUrl: product.primary_image?.image || product.imageUrl || '/placeholder-product.png',
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

  if (loading) {
    return (
      <Layout>
        <div className="products-page">
          <div className="loading-message">
            <p>{t('products.loading_products')}</p>
          </div>
        </div>
      </Layout>
    );
  }

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

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>{t('products.products_tab')}</button>
          <button className={`tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>{t('products.services_tab')}</button>
        </div>

        {activeTab === 'products' ? (
          filteredProducts.length > 0 ? (
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
              <p>{searchTerm ? t('products.no_search_results', { searchTerm }) : t('products.no_products_available')}</p>
            </div>
          )
        ) : (
          <ServicesPlaceholder />
        )}
      </div>
    </Layout>
  );
};

export default ProductList;
