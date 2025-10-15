import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ViewSellerAccount from '@/components/Common/ViewSellerAccount';
import { productService } from '@/features/marketplace/api';
import { userService } from '../../../features/users/api';
import './SellerProfilePage.css';

interface SellerProfile {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  job_title?: string;
  company?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  is_verified_seller?: boolean;
  seller_type?: string;
  created_at?: string;
}

const SellerProfilePage: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadSellerProfile = async () => {
      if (!sellerId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch seller profile from API
        const sellerProfile = await userService.getSellerProfile(parseInt(sellerId));
        setSeller(sellerProfile);
        
        // Load seller's products
        try {
          const products = await productService.getProducts({ seller: sellerId });
          setSellerProducts(products.results || []);
        } catch (productError) {
          console.warn('Could not load seller products:', productError);
          setSellerProducts([]);
        }
        
      } catch (err: any) {
        console.error('Error loading seller profile:', err);
        
                 // Provide more specific error messages
         if (err.message?.includes('not found') || err.message?.includes('404')) {
           setError('User profile not found. This user may no longer be active.');
         } else if (err.message?.includes('Failed to fetch')) {
           setError('Unable to load user profile. Please check your connection and try again.');
         } else {
           setError('Failed to load user profile. Please try again later.');
         }
      } finally {
        setLoading(false);
      }
    };

    loadSellerProfile();
  }, [sellerId]);

  if (loading) {
    return (
      <Layout>
        <div className="seller-profile-page">
          <div className="seller-profile-skeleton">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-info">
                <div className="skeleton-name"></div>
                <div className="skeleton-bio"></div>
              </div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-section"></div>
              <div className="skeleton-section"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !seller) {
    return (
      <Layout>
                 <div className="seller-profile-error">
           <div className="error-icon">⚠️</div>
           <h3>User Not Found</h3>
           <p>{error || 'The user profile you\'re looking for doesn\'t exist.'}</p>
           <Link to="/products" className="back-to-products-btn">
             Browse Products
           </Link>
         </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="seller-profile-page">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav">
          <Link to="/products" className="breadcrumb-link">Products</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/seller/${seller.id}`} className="breadcrumb-current">
            {seller.first_name && seller.last_name 
              ? `${seller.first_name} ${seller.last_name}`
              : seller.username
            }
          </Link>
        </nav>

        {/* Seller Profile */}
        <div className="seller-profile-section">
          <ViewSellerAccount 
            seller={seller}
            showContactInfo={true}
            showSocialMedia={true}
            showProfessionalInfo={true}
          />
        </div>

                 {/* User's Products */}
         {sellerProducts.length > 0 && (
           <div className="seller-products-section">
             <h2 className="section-title">Products by {seller.first_name || seller.username}</h2>
            <div className="products-grid">
              {sellerProducts.slice(0, 6).map((product) => (
                <Link 
                  key={product.id} 
                  to={`/products/${product.slug}`}
                  className="product-card"
                >
                  <div className="product-image">
                    <img 
                      src={product.images?.[0]?.presigned_url || '/placeholder-product.svg'} 
                      alt={product.name}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">${product.price}</p>
                    <div className="product-meta">
                      <span className="product-condition">{product.condition}</span>
                      {product.is_featured && (
                        <span className="featured-badge">Featured</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {sellerProducts.length > 6 && (
              <div className="view-all-products">
                <Link to={`/products?seller=${seller.id}`} className="view-all-btn">
                  View All {sellerProducts.length} Products
                </Link>
              </div>
            )}
          </div>
        )}

                 {/* No Products Message */}
         {sellerProducts.length === 0 && (
           <div className="no-products-section">
             <div className="no-products-icon">📦</div>
             <h3>No Products Available</h3>
             <p>This user hasn't listed any products yet.</p>
           </div>
         )}
      </div>
    </Layout>
  );
};

export default SellerProfilePage;
