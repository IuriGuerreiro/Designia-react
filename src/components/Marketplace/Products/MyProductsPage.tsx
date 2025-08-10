import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import { useTranslation } from 'react-i18next';
import { productService } from '../../../services';
import { type ProductListItem } from '../../../types/marketplace';
import './MyProducts.css';

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
      <div className="my-products-page">
        <div className="page-header">
          <h2 className="page-title">{t('products.my_products_title')}</h2>
          <div className="header-actions">
            <Link to="/products/new" className="btn btn-primary">
              {t('products.add_new_product')}
            </Link>
          </div>
        </div>

        {error && <div className="error-message"><p>{error}</p></div>}

        {products.length > 0 ? (
          <div className="my-products-grid">
            {products.map(product => (
              <div key={product.id} className="my-product-card">
                <Link to={`/products/${product.slug}`} className="product-image-link">
                  <img 
                    src={product.primary_image?.image || '/placeholder-product.png'} 
                    alt={product.name} 
                    className="product-image"
                  />
                </Link>
                <div className="my-product-card-info">
                  <div className="product-details">
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="product-name">{product.name}</h3>
                    </Link>
                    <div className="product-meta">
                      <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
                      <span className={`product-stock ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : t('products.out_of_stock')}
                      </span>
                    </div>
                  </div>
                  <div className="product-status-badges">
                    {product.is_active ? (
                      <span className="status-badge active">Active</span>
                    ) : (
                      <span className="status-badge inactive">Inactive</span>
                    )}
                    {product.is_featured && (
                      <span className="status-badge featured">Featured</span>
                    )}
                  </div>
                  <div className="my-product-card-actions">
                    <button onClick={() => navigate(`/metrics/product/${product.slug}`)} className="btn btn-sm btn-info">{t('products.metrics')}</button>
                    <button onClick={() => navigate(`/products/${product.slug}/edit`)} className="btn btn-sm btn-secondary">{t('products.edit')}</button>
                    <button onClick={() => handleDelete(product.id, product.slug!)} className="btn btn-sm btn-danger">{t('products.delete')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products-message">
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