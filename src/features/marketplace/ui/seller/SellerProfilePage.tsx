import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/app/layout';
import ProductCard from '@/features/marketplace/ui/products/ProductCard';
import { productService } from '@/features/marketplace/api';
import { useCart } from '@/shared/state/CartContext';
import type { ProductListItem } from '@/features/marketplace/model';
import { userService } from '@/features/users/api';
import styles from './SellerProfilePage.module.css';
import '@/features/marketplace/ui/products/ProductList.module.css';

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
  const { t } = useTranslation();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerProducts, setSellerProducts] = useState<ProductListItem[]>([]);
  const { addToCart } = useCart();

  const handleAddToCart = async (product: ProductListItem) => {
    // Prefer presigned_url → image_url → image → placeholder
    let imageUrl = '/placeholder-product.png';
    const img = product.primary_image;
    if (img) {
      if (img.presigned_url && img.presigned_url !== 'null') imageUrl = img.presigned_url;
      else if (img.image_url && img.image_url !== 'null') imageUrl = img.image_url;
      else if (img.image && img.image !== 'null') imageUrl = img.image;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? product.price : String(product.price),
      imageUrl,
      quantity: 1,
      availableStock: product.stock_quantity,
      isActive: product.is_in_stock,
    };

    try {
      await addToCart(cartItem as any);
    } catch (e) {
      console.error('Failed to add to cart', e);
    }
  };

  useEffect(() => {
    if (!sellerId) {
      setLoading(false);
      return;
    }

    const sellerIdNum = parseInt(sellerId, 10);
    setLoading(true);
    setError(null);

    Promise.allSettled([
      userService.getSellerProfile(sellerIdNum),
      productService.getProducts({ seller_id: sellerIdNum }),
    ])
      .then(([profileRes, productsRes]) => {
        // Profile
        if (profileRes.status === 'fulfilled') {
          setSeller(profileRes.value);
        } else {
          console.error('Error loading seller profile:', profileRes.reason);
          const msg = profileRes.reason?.message || t('seller_page.errors.load_profile');
          setError(
            msg.includes('not found') || msg.includes('404')
              ? t('seller_page.errors.not_found')
              : msg,
          );
          setSeller(null);
        }

        // Products
        if (productsRes.status === 'fulfilled') {
          const p: any = productsRes.value as any;
          const list = Array.isArray(p) ? p : p?.results ?? [];
          setSellerProducts(list);
        } else {
          console.warn('Could not load seller products:', productsRes.reason);
          setSellerProducts([]);
        }
      })
      .finally(() => setLoading(false));
  }, [sellerId]);

  if (loading) {
    return (
      <Layout>
        <div className={styles['seller-profile-page']}>
          <div className={styles['seller-profile-skeleton']}>
            <div className={styles['skeleton-header']}>
              <div className={styles['skeleton-avatar']}></div>
              <div className={styles['skeleton-info']}>
                <div className={styles['skeleton-name']}></div>
                <div className={styles['skeleton-bio']}></div>
              </div>
            </div>
            <div className={styles['skeleton-content']}>
              <div className={styles['skeleton-section']}></div>
              <div className={styles['skeleton-section']}></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !seller) {
    return (
      <Layout>
                 <div className={styles['seller-profile-error']}>
           <div className={styles['error-icon']}>⚠️</div>
           <h3>User Not Found</h3>
           <p>{error || 'The user profile you\'re looking for doesn\'t exist.'}</p>
           <Link to="/products" className={styles['back-to-products-btn']}>
             Browse Products
           </Link>
         </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['seller-profile-page']}>
        {/* Breadcrumb Navigation */}
        <nav className={styles['breadcrumb-nav']}>
          <Link to="/products" className={styles['breadcrumb-link']}>Products</Link>
          <span className={styles['breadcrumb-separator']}>/</span>
          <Link to={`/seller/${seller.id}`} className={styles['breadcrumb-current']}>
            {seller.first_name && seller.last_name 
              ? `${seller.first_name} ${seller.last_name}`
              : seller.username
            }
          </Link>
        </nav>

        {/* Seller Profile - compact header */}
        <div className={styles['seller-profile-section']}>
          <div className={styles['seller-header-card']}>
            <div className={styles['seller-header-inner']}>
              <div className={styles['seller-avatar-block']}>
                {seller.avatar ? (
                  <img className={styles['seller-avatar-img']} src={seller.avatar} alt={`${seller.first_name || seller.username} avatar`} />
                ) : (
                  <div className={styles['seller-avatar-fallback']}>{(seller.first_name?.[0] || seller.username[0]).toUpperCase()}</div>
                )}
              </div>
              <div className={styles['seller-header-info']}>
                <h1 className={styles['seller-title']}>
                  {seller.company?.trim() || (seller.first_name && seller.last_name ? `${seller.first_name} ${seller.last_name}` : seller.username)}
                </h1>
                <div className={styles['seller-sub']}>
                  <span className={styles['seller-username']}>@{seller.username}</span>
                  {seller.is_verified_seller && <span className={`${styles['seller-badge']} verified`}>Verified Seller</span>}
                  {(!seller.is_verified_seller && (seller as any).role === 'admin') && (
                    <span className={`${styles['seller-badge']} admin`}>Admin</span>
                  )}
                </div>
                <div className={styles['seller-links']}>
                  {seller.website && (
                    <a className={styles['seller-link']} href={seller.website.startsWith('http') ? seller.website : `https://${seller.website}`} target="_blank" rel="noreferrer">
                      🌐 Website
                    </a>
                  )}
                  {seller.location && (
                    <a
                      className={styles['seller-link']}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(seller.location)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📍 {seller.location}
                    </a>
                  )}
                </div>
                <div className={styles['seller-metrics']}>
                  <div className={styles['metric']}><span className={styles['metric-value']}>{sellerProducts.length}</span><span className={styles['metric-label']}>{t('seller_page.metrics.products')}</span></div>
                  <div className={styles['metric']}><span className={styles['metric-value']}>{new Date(seller.created_at || '').toLocaleDateString()}</span><span className={styles['metric-label']}>{t('seller_page.metrics.member_since')}</span></div>
                </div>
              </div>
            </div>
          </div>
          {/* Seller details (bio, professional info, socials) */}
          {(seller.bio || seller.instagram_url || seller.twitter_url || seller.linkedin_url || seller.facebook_url || seller.website || (seller as any)?.email || (seller as any)?.profile?.phone_number) && (
            <div className="seller-details-card">
              {seller.bio && <p className="seller-bio-text">{seller.bio}</p>}
              <div className="seller-details-grid">
                {/* Contact Info */}
                {(seller.website || (seller as any)?.email || (seller as any)?.profile?.phone_number) && (
                  <div className="seller-detail">
                    <h4 className="detail-title">{t('seller_page.contact')}</h4>
                    <ul className="detail-list">
                      {seller.website && (
                        <li>
                          <span className="detail-key">{t('seller_page.website')}:</span>
                          <a className="detail-link" href={seller.website.startsWith('http') ? seller.website : `https://${seller.website}`} target="_blank" rel="noreferrer">{seller.website}</a>
                        </li>
                      )}
                      {(seller as any)?.email && (
                        <li>
                          <span className="detail-key">{t('seller_page.email')}:</span>
                          <a className="detail-link" href={`mailto:${(seller as any).email}`}>{(seller as any).email}</a>
                        </li>
                      )}
                      {(seller as any)?.profile?.phone_number && (
                        <li>
                          <span className="detail-key">{t('seller_page.phone')}:</span>
                          <a className="detail-link" href={`tel:${(seller as any).profile?.phone_number}`}>{(seller as any).profile?.phone_number}</a>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {(seller.instagram_url || seller.twitter_url || seller.linkedin_url || seller.facebook_url) && (
                  <div className={styles['seller-detail']}>
                    <h4 className={styles['detail-title']}>{t('seller_page.social')}</h4>
                    <ul className={styles['detail-list']}>
                      {seller.instagram_url && (
                        <li><a className={styles['detail-link']} href={seller.instagram_url.startsWith('http') ? seller.instagram_url : `https://${seller.instagram_url}`} target="_blank" rel="noreferrer">📷 Instagram</a></li>
                      )}
                      {seller.twitter_url && (
                        <li><a className={styles['detail-link']} href={seller.twitter_url.startsWith('http') ? seller.twitter_url : `https://${seller.twitter_url}`} target="_blank" rel="noreferrer">🐦 Twitter</a></li>
                      )}
                      {seller.linkedin_url && (
                        <li><a className={styles['detail-link']} href={seller.linkedin_url.startsWith('http') ? seller.linkedin_url : `https://${seller.linkedin_url}`} target="_blank" rel="noreferrer">💼 LinkedIn</a></li>
                      )}
                      {seller.facebook_url && (
                        <li><a className={styles['detail-link']} href={seller.facebook_url.startsWith('http') ? seller.facebook_url : `https://${seller.facebook_url}`} target="_blank" rel="noreferrer">📘 Facebook</a></li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

                 {/* User's Products */}
        {sellerProducts.length > 0 && (
          <div className={styles['seller-products-section']}>
            <h2 className={styles['section-title']}>{t('seller_page.products_by', { name: seller.first_name || seller.username })}</h2>
            <div className={styles['products-grid']}>
              {sellerProducts.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  displayMode="customer"
                />
              ))}
            </div>
            {sellerProducts.length > 6 && (
              <div className={styles['view-all-products']}>
                <Link to={`/products?seller_id=${seller.id}`} className={styles['view-all-btn']}>
                  {t('seller_page.view_all_products', { count: sellerProducts.length })}
                </Link>
              </div>
            )}
          </div>
        )}

                 {/* No Products Message */}
         {sellerProducts.length === 0 && (
           <div className={styles['no-products-section']}>
             <div className={styles['no-products-icon']}>📦</div>
             <h3>{t('seller_page.no_products_title')}</h3>
             <p>{t('seller_page.no_products_message')}</p>
           </div>
         )}
      </div>
    </Layout>
  );
};

export default SellerProfilePage;
