import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styles from './ProductList.module.css';
import { Layout } from '@/app/layout';
import ProductCard from './ProductCard';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/shared/state/CartContext';
import { categoryService, productService } from '@/features/marketplace/api';
import { type ProductListItem, type ProductFilters } from '@/features/marketplace/model';

// Skeleton Loading Component
const ProductCardSkeleton: React.FC = () => {
  return (
    <div className={styles['product-card-skeleton']}>
      <div className={styles['skeleton-image']}></div>
      <div className={styles['skeleton-content']}>
        <div className={styles['skeleton-title']}></div>
        <div className={styles['skeleton-price']}></div>
        <div className={styles['skeleton-description']}></div>
        <div className={styles['skeleton-button']}></div>
      </div>
    </div>
  );
};

// Filter Component
const ProductFilters: React.FC<{
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  categories: any[];
  isOpen: boolean;
  onClose: () => void;
  activeFiltersCount: number;
}> = ({ filters, onFilterChange, categories, isOpen, onClose, activeFiltersCount }) => {
  const { t } = useTranslation();

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value, startIndex: 0 }); // Reset to first slice
  };

  const clearFilters = () => {
    onFilterChange({ startIndex: 0, pageSize: filters.pageSize ?? 20 });
  };

  return (
    <aside
      id="marketplace-filters"
      className={`${styles['product-filters']} ${isOpen ? styles['open'] : ''}`}
      aria-hidden={!isOpen}
    >
  <div className={styles['filters-header']}>
        <div>
          <p className={styles['filters-eyebrow']}>{t('products.filters.refine_results')}</p>
          <h3>{t('products.filters.title')}</h3>
        </div>
        <div className={styles['filters-actions']}>
          <span className={styles['filters-count']}>{t('products.filters.active_count', { count: activeFiltersCount })}</span>
          <button onClick={clearFilters} className={styles['clear-filters-btn']} type="button">
            {t('products.filters.clear')}
          </button>
          <button className={styles['filters-close']} onClick={onClose} type="button" aria-label={t('products.filters.close_aria')}>
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
      </div>
      
  <div className={styles['filter-section']}>
        <label>{t('products.filters.price_range')}</label>
  <div className={styles['price-range']}>
          <input
            type="number"
            placeholder={t('products.filters.min')}
            min={0}
            step={1}
            value={filters.min_price ?? ''}
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') return handleFilterChange('min_price', undefined);
              const n = Math.max(0, Number(val));
              handleFilterChange('min_price', Number.isNaN(n) ? undefined : n);
            }}
            className={styles['price-input']}
          />
          <span>-</span>
          <input
            type="number"
            placeholder={t('products.filters.max')}
            min={0}
            step={1}
            value={filters.max_price ?? ''}
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') return handleFilterChange('max_price', undefined);
              const n = Math.max(0, Number(val));
              handleFilterChange('max_price', Number.isNaN(n) ? undefined : n);
            }}
            className={styles['price-input']}
          />
        </div>
      </div>

  <div className={styles['filter-section']}>
        <label>{t('products.filters.category')}</label>
        <select
          value={filters.category_slug || ''}
          onChange={(e) => handleFilterChange('category_slug', e.target.value || undefined)}
          className={styles['filter-select']}
        >
          <option value="">{t('products.filters.all_categories')}</option>
          {categories.map(category => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

  <div className={styles['filter-section']}>
        <label>Condition</label>
        <div className={styles['checkbox-group']}>
          {['new', 'like_new', 'good', 'fair', 'poor'].map(condition => (
            <label key={condition} className={styles['checkbox-label']}>
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

  <div className={styles['filter-section']}>
        <label>{t('products.filters.availability')}</label>
        <div className={styles['checkbox-group']}>
          <label className={styles['checkbox-label']}>
            <input
              type="checkbox"
              checked={filters.in_stock || false}
              onChange={(e) => handleFilterChange('in_stock', e.target.checked || undefined)}
            />
            <span>{t('products.filters.in_stock_only')}</span>
          </label>
          <label className={styles['checkbox-label']}>
            <input
              type="checkbox"
              checked={filters.is_featured || false}
              onChange={(e) => handleFilterChange('is_featured', e.target.checked || undefined)}
            />
            <span>{t('products.filters.featured_products')}</span>
          </label>
          <label className={styles['checkbox-label']}>
            <input
              type="checkbox"
              checked={filters.is_on_sale || false}
              onChange={(e) => handleFilterChange('is_on_sale', e.target.checked || undefined)}
            />
            <span>{t('products.filters.on_sale')}</span>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <label>{t('products.filters.rating')}</label>
        <select
          value={filters.min_rating || ''}
          onChange={(e) => handleFilterChange('min_rating', e.target.value ? Number(e.target.value) : undefined)}
          className={styles['filter-select']}
        >
          <option value="">{t('products.filters.any_rating')}</option>
          <option value="4">{t('products.filters.rating_4')}</option>
          <option value="3">{t('products.filters.rating_3')}</option>
          <option value="2">{t('products.filters.rating_2')}</option>
        </select>
      </div>
    </aside>
  );
};

// Sort Component
const ProductSort: React.FC<{
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  disabled?: boolean;
}> = ({ sortBy, onSortChange, disabled = false }) => {
  const { t } = useTranslation();
  return (
    <div className={styles['product-sort']}>
      <label htmlFor="marketplace-sort">{t('products.sort.label')}</label>
      <select
        id="marketplace-sort"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className={styles['sort-select']}
        disabled={disabled}
      >
        <option value="newest">{t('products.sort.newest')}</option>
        <option value="oldest">{t('products.sort.oldest')}</option>
        <option value="price_low">{t('products.sort.price_low')}</option>
        <option value="price_high">{t('products.sort.price_high')}</option>
        <option value="rating">{t('products.sort.rating')}</option>
        <option value="popular">{t('products.sort.popular')}</option>
        <option value="name">{t('products.sort.name')}</option>
      </select>
    </div>
  );
};

const ServicesPlaceholder: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles['services-placeholder']}>
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination (offset-based) state for infinite scroll
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentStart, setCurrentStart] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [nextStart, setNextStart] = useState<number | null>(null);

  // Debounced search input to avoid firing requests on every keystroke
  const [searchInput, setSearchInput] = useState<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);
  
  // State for UI
  const [activeTab, setActiveTab] = useState('products');
  const [showFilters, setShowFilters] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const [sortBy, setSortBy] = useState('newest');
  
  // State for filters
  const [filters, setFilters] = useState<ProductFilters>({
    startIndex: 0,
    pageSize: 20,
  });

  // Load products and categories from API
  useEffect(() => {
    const loadData = async () => {
      const mySeq = ++requestSeq.current;
      setLoading(true);
      setError(null);

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getProducts({ ...filters, startIndex: 0 }),
          categoryService.getCategories()
        ]);

        // Extract results array and pagination metadata
        const results = (productsResponse as any).results || productsResponse;
        const count = (productsResponse as any).count ?? (Array.isArray(results) ? results.length : 0);
        const respPageSize = (productsResponse as any).pageSize ?? filters.pageSize ?? pageSize;
        const hasN = (productsResponse as any).hasNext ?? Boolean((productsResponse as any).next);
        const nextS = (productsResponse as any).nextStartIndex ?? null;
        if (mySeq === requestSeq.current) {
          setProducts(Array.isArray(results) ? results : []);
          setCategories(categoriesResponse);
          setTotalCount(typeof count === 'number' ? count : 0);
          setPageSize(typeof respPageSize === 'number' ? respPageSize : 20);
          setCurrentStart(0);
          setHasNext(Boolean(hasN));
          setNextStart(typeof nextS === 'number' ? nextS : null);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load products. Please check your connection and try again.');
        setProducts([]);
        setHasNext(false);
        setNextStart(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // Debounce search updates to filters so we don't block typing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined, startIndex: 0 }));
    }, 350);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchInput]);

  // Load more handler
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNext || nextStart === null) return;
    setLoadingMore(true);
    try {
      const resp = await productService.getProducts({ ...filters, startIndex: nextStart, pageSize });
      const nextResults = (resp as any).results || resp;
      const hasN = (resp as any).hasNext ?? Boolean((resp as any).next);
      const nextS = (resp as any).nextStartIndex ?? null;
      setProducts((prev) => prev.concat(Array.isArray(nextResults) ? nextResults : []));
      setCurrentStart(nextStart);
      setHasNext(Boolean(hasN));
      setNextStart(typeof nextS === 'number' ? nextS : null);
    } catch (err) {
      console.error('Failed to load more products:', err);
      // Keep hasNext as-is but stop further auto-trigger on this attempt
    } finally {
      setLoadingMore(false);
    }
  }, [filters, loadingMore, hasNext, nextStart, pageSize]);

  // IntersectionObserver to auto-load more when reaching the sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasNext) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
    }, { root: null, rootMargin: '200px', threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, loadMore]);

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

  const activeFiltersCount = useMemo(() => {
    const keys: Array<keyof ProductFilters> = [
      'min_price',
      'max_price',
      'category_slug',
      'condition',
      'in_stock',
      'is_featured',
      'is_on_sale',
      'min_rating'
    ];

    let count = 0;

    keys.forEach((key) => {
      const value = filters[key];

      if (Array.isArray(value)) {
        if (value.length > 0) count += 1;
      } else if (typeof value === 'boolean') {
        if (value) count += 1;
      } else if (value !== undefined && value !== null && value !== '') {
        count += 1;
      }
    });

    if (filters.search && filters.search.trim()) {
      count += 1;
    }

    return count;
  }, [filters]);

  const heroMetrics = useMemo(
    () => [
      { label: 'Pieces in view', value: processedProducts.length },
      { label: 'Categories', value: categories.length },
      { label: 'Active filters', value: activeFiltersCount }
    ],
    [processedProducts.length, categories.length, activeFiltersCount]
  );

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
      <div className={styles['products-flex']}>
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  };

  return (
    <Layout padding="minimal" maxWidth="full">
      <div className={styles['products-page']}>
        <section className={styles['marketplace-hero']}>
          <div className={styles['hero-overlay']} aria-hidden="true" />
          <div className={styles['hero-inner']}>
            <div className={styles['hero-copy']}>
              <span className={styles['hero-eyebrow']}>Designia Marketplace</span>
              <h2 className={styles['hero-title']}>{t('products.collection_title')}</h2>
              <p className={styles['hero-description']}>
                Discover monochrome pieces, curated textures, and statement silhouettes crafted for contemporary homes and studios.
              </p>
              <div className={styles['hero-metrics']} role="list">
                {heroMetrics.map((metric) => (
                  <div className={styles['hero-metric']} role="listitem" key={metric.label}>
                    <span className={styles['metric-value']}>{metric.value}</span>
                    <span className={styles['metric-label']}>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles['hero-controls']}>
              <div className={styles['search-bar']}>
                <label className="sr-only" htmlFor="marketplace-search">{t('products.search_placeholder')}</label>
                <input
                  id="marketplace-search"
                  type="text"
                  placeholder={t('products.search_placeholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <div className={styles['hero-actions']}>
                <button
                  type="button"
                  className={`${styles['filter-toggle-btn']} ${showFilters ? styles['active'] : ''}`}
                  onClick={() => setShowFilters((prev) => !prev)}
                  disabled={loading}
                  aria-controls="marketplace-filters"
                  aria-expanded={showFilters}
                  aria-label={showFilters ? t('products.filters.close_aria') : t('products.filters.open_aria')}
                >
                  {showFilters ? (
                    <>
                      <span className="material-symbols-outlined" aria-hidden="true">
                        close
                      </span>
                      {t('orders.actions.close')}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" aria-hidden="true">
                        tune
                      </span>
                      {t('products.filters.title')}
                    </>
                  )}
                  {activeFiltersCount > 0 && <span className={styles['filters-badge']}>{activeFiltersCount}</span>}
                </button>
                <ProductSort sortBy={sortBy} onSortChange={setSortBy} disabled={loading} />
              </div>
            </div>
          </div>
        </section>

        <div className={styles['tabs']}>
          <button
            className={`${styles['tab']} ${activeTab === 'products' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('products')}
            disabled={loading}
          >
            {t('products.products_tab')}
          </button>
          <button
            className={`${styles['tab']} ${activeTab === 'services' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('services')}
            disabled={loading}
          >
            {t('products.services_tab')}
          </button>
        </div>

        {error && (
          <div className={styles['error-message']}>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles['retry-btn']}
            >
              {t('orders.actions.try_again')}
            </button>
          </div>
        )}

        {activeTab === 'products' ? (
          <section className={`${styles['products-shell']} ${showFilters ? styles['filters-visible'] : ''}`}>
            <ProductFilters
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              activeFiltersCount={activeFiltersCount}
            />

            <div className={styles['products-main']}>
              <div className={styles['products-controls']}>
                <div className={styles['results-info']}>
                  <span>
                    {processedProducts.length} curated piece{processedProducts.length !== 1 ? 's' : ''}
                  </span>
                  {activeFiltersCount > 0 && (
                    <span className={styles['results-filters']}>{t('products.filters.active_count', { count: activeFiltersCount })}</span>
                  )}
                </div>
              </div>

              {loading ? (
                renderLoadingSkeletons()
              ) : processedProducts.length > 0 ? (
                <div className={styles['products-flex']}>
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
                <div className={styles['no-results-message']}>
                  <div className={styles['no-results-icon']}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>{t('products.no_products_found')}</h3>
                  <p>{filters.search ? t('products.no_products_by_search', { term: filters.search }) : t('products.no_products_available')}</p>
                </div>
              )}

              {/* Infinite scroll sentinel and fallback load more button */}
              {!loading && processedProducts.length > 0 && (
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {hasNext && (
                    <>
                      <div ref={sentinelRef} style={{ height: 1, width: '100%' }} />
                      <button
                        type="button"
                        className={styles['load-more-btn']}
                        onClick={loadMore}
                        disabled={loadingMore}
                        style={{ marginTop: '12px' }}
                      >
                        {loadingMore ? t('products.loading_more') : t('products.load_more', { count: pageSize })}
                      </button>
                    </>
                  )}
                  {!hasNext && (
                    <div className={styles['end-of-results']} style={{ color: '#666', fontSize: 14, padding: '8px' }}>
                      {t('products.end_of_results')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        ) : (
          <ServicesPlaceholder />
        )}
      </div>
    </Layout>
  );
};

export default ProductList;
