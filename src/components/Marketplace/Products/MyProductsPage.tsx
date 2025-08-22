import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useTranslation } from 'react-i18next';
import { productService } from '../../../services';
import { type ProductListItem } from '../../../types/marketplace';
import './Products.css';

const MyProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


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

  if (loading) {
    return (
      <Layout>
        <div className="my-products-page">
          <p>Loading your products...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="products-page">
        {/* Header matching ProductList styling */}
        <div className="products-header">
          <h2>{t('products.my_products_title')}</h2>
          <div className="header-actions">
            <Link to="/products/new" className="btn btn-primary">
              {t('products.add_new_product')}
            </Link>
          </div>
        </div>

        {/* Error message matching ProductList styling */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Products grid matching ProductList layout */}
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card my-product-card">
                {/* Product badges */}
                <div className="product-card-badges">
                  {product.is_featured && (
                    <span className="badge bestseller-badge">Featured</span>
                  )}
                  {!product.is_active && (
                    <span className="badge sale-badge">Inactive</span>
                  )}
                </div>

                {/* Product image */}
                <Link to={`/products/${product.slug}`} className="product-image-link">
                  <div className="product-image-container">
                    <img 
                      src={(() => {
                        // Enhanced image URL resolution with automatic assimilation support
                        let imageUrl = '/placeholder-product.png';
                        
                        if (product.primary_image) {
                          // Use display_url if available (from automatic assimilation)
                          if (product.primary_image.display_url) {
                            imageUrl = product.primary_image.display_url;
                          }
                          // Fallback to manual resolution if display_url not available
                          else if (product.primary_image.presigned_url && product.primary_image.presigned_url !== 'null' && product.primary_image.presigned_url !== null) {
                            imageUrl = product.primary_image.presigned_url;
                          } else if (product.primary_image.image_url && product.primary_image.image_url !== 'null' && product.primary_image.image_url !== null) {
                            imageUrl = product.primary_image.image_url;
                          } else if (product.primary_image.image && product.primary_image.image !== 'null' && product.primary_image.image !== null) {
                            imageUrl = product.primary_image.image;
                          }
                        }
                        
                        console.log('=== MY PRODUCTS PAGE - IMAGE DEBUG ===');
                        console.log('Product:', product.name);
                        console.log('Primary image data:', product.primary_image);
                        console.log('Selected imageUrl:', imageUrl);
                        console.log('URL source:', product.primary_image?.url_source || 'manual_fallback');
                        
                        return imageUrl;
                      })()} 
                      alt={product.name} 
                      className="product-image"
                    />
                    {!product.stock_quantity && (
                      <div className="out-of-stock-overlay">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product info */}
                <div className="product-info">
                  {/* Product meta top */}
                  <div className="product-meta-top">
                    <span className="product-seller">Your Product</span>
                    <span className="condition-badge">
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Product name */}
                  <Link to={`/products/${product.slug}`} className="product-name-link">
                    <h3 className="product-name">{product.name}</h3>
                  </Link>

                  {/* Product rating - placeholder since my products don't have reviews */}
                  <div className="product-rating">
                    <span className="no-reviews">
                      Stock: {product.stock_quantity || 0} units
                    </span>
                  </div>

                  {/* Product pricing */}
                  <div className="product-pricing">
                    <span className="current-price">${parseFloat(product.price).toFixed(2)}</span>
                  </div>


                  {/* Product actions */}
                  <div className="product-actions my-product-actions">
                    <button 
                      onClick={() => navigate(`/metrics/product/${product.slug}`)} 
                      className="btn btn-sm btn-secondary"
                      title="View Analytics"
                    >
                      {t('products.metrics')}
                    </button>
                    <button 
                      onClick={() => navigate(`/products/${product.slug}/edit`)} 
                      className="btn btn-sm btn-primary"
                      title="Edit Product"
                    >
                      {t('products.edit')}
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id.toString(), product.slug!)} 
                      className="btn btn-sm btn-danger"
                      title="Delete Product"
                    >
                      {t('products.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results-message">
            <h3>{t('products.no_products_found')}</h3>
            <p>{t('products.start_selling_prompt')}</p>
            <Link to="/products/new" className="btn btn-primary btn-lg">
              {t('products.add_first_product')}
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProductsPage;