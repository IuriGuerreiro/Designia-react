import { apiRequest, API_ENDPOINTS } from '../config/api';
import { type Product, type ProductListItem, type ProductFilters, type ProductReview, type PaginatedResponse } from '../types/marketplace';

export class ProductService {
  private static instance: ProductService;

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  /**
   * Get all products with filters
   */
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<ProductListItem>> {
    console.log('=== PRODUCT SERVICE - GET PRODUCTS ===');
    console.log('Filters:', filters);
    
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }
      
      const url = `${API_ENDPOINTS.PRODUCTS}${params.toString() ? `?${params.toString()}` : ''}`;
      const result = await apiRequest(url);
      
      console.log('Products retrieved:', {
        count: result?.results?.length || result?.length || 0,
        total: result?.count || 'unknown',
        hasResults: !!(result?.results || result)
      });
      
      return result;
    } catch (error) {
      console.error('=== PRODUCT SERVICE ERROR ===');
      console.error('Error getting products:', error);
      throw error;
    }
  }

  /**
   * Get product by slug
   */
  async getProduct(slug: string): Promise<Product> {
    console.log('=== PRODUCT SERVICE - GET PRODUCT ===');
    console.log('Product slug:', slug);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.PRODUCT_DETAIL(slug));
      console.log('Product retrieved:', {
        name: result?.name,
        id: result?.id,
        slug: result?.slug,
        price: result?.price,
        inStock: result?.is_in_stock
      });
      return result;
    } catch (error) {
      console.error('=== PRODUCT SERVICE ERROR ===');
      console.error('Error getting product:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Product not found.');
      }
      throw error;
    }
  }

  /**
   * Create new product
   */
  async createProduct(productData: FormData): Promise<Product> {
    console.log('=== PRODUCT SERVICE - CREATE PRODUCT ===');
    
    try {
      const result = await apiRequest(API_ENDPOINTS.PRODUCTS, {
        method: 'POST',
        body: productData,
        headers: {}, // Don't set Content-Type for FormData
      });
      
      console.log('Product created:', {
        name: result?.name,
        id: result?.id,
        slug: result?.slug
      });
      
      return result;
    } catch (error) {
      console.error('=== PRODUCT SERVICE ERROR ===');
      console.error('Error creating product:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to create products.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You may need seller permissions.');
      }
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(slug: string, productData: FormData): Promise<Product> {
    console.log('=== PRODUCT SERVICE - UPDATE PRODUCT ===');
    console.log('Product slug:', slug);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.PRODUCT_DETAIL(slug), {
        method: 'PATCH',
        body: productData,
        headers: {}, // Don't set Content-Type for FormData
      });
      
      console.log('Product updated:', {
        name: result?.name,
        id: result?.id,
        slug: result?.slug
      });
      
      return result;
    } catch (error) {
      console.error('=== PRODUCT SERVICE ERROR ===');
      console.error('Error updating product:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to update products.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only update your own products.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Product not found.');
      }
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(slug: string): Promise<void> {
    console.log('=== PRODUCT SERVICE - DELETE PRODUCT ===');
    console.log('Product slug:', slug);
    
    try {
      await apiRequest(API_ENDPOINTS.PRODUCT_DETAIL(slug), {
        method: 'DELETE',
      });
      
      console.log('Product deleted successfully');
    } catch (error) {
      console.error('=== PRODUCT SERVICE ERROR ===');
      console.error('Error deleting product:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to delete products.');
      } else if (error instanceof Error && error.message.includes('403')) {
        throw new Error('Permission denied. You can only delete your own products.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Product not found.');
      }
      throw error;
    }
  }

  /**
   * Track product click
   */
  async trackClick(slug: string): Promise<{ clicked: boolean }> {
    console.log('=== PRODUCT SERVICE - TRACK CLICK ===');
    console.log('Product slug:', slug);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.PRODUCT_CLICK(slug), {
        method: 'POST',
      });
      
      console.log('Click tracked:', result);
      return result;
    } catch (error) {
      console.error('=== PRODUCT SERVICE ERROR ===');
      console.error('Error tracking click:', error);
      // Don't throw error for click tracking to avoid blocking navigation
      return { clicked: false };
    }
  }

  /**
   * Get product reviews
   */
  async getProductReviews(slug: string): Promise<ProductReview[]> {
    console.log('=== PRODUCT SERVICE - GET REVIEWS ===');
    console.log('Product slug:', slug);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.PRODUCT_REVIEWS(slug));
      console.log('Reviews retrieved:', {
        count: result?.length || 0,
        hasResults: !!result
      });
      return result;
    } catch (error) {
      console.error('=== PRODUCT SERVICE ERROR ===');
      console.error('Error getting reviews:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Product not found.');
      }
      throw error;
    }
  }

  /**
   * Add product review
   */
  async addProductReview(slug: string, reviewData: { rating: number; title?: string; comment?: string }): Promise<ProductReview> {
    console.log('=== PRODUCT SERVICE - ADD REVIEW ===');
    console.log('Product slug:', slug);
    console.log('Review data:', reviewData);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.PRODUCT_ADD_REVIEW(slug), {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
      
      console.log('Review added:', {
        id: result?.id,
        rating: result?.rating
      });
      
      return result;
    } catch (error) {
      console.error('=== PRODUCT SERVICE ERROR ===');
      console.error('Error adding review:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to add reviews.');
      } else if (error instanceof Error && error.message.includes('400')) {
        throw new Error('You have already reviewed this product.');
      } else if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Product not found.');
      }
      throw error;
    }
  }

  /**
   * Get user's products
   */
  async getMyProducts(): Promise<ProductListItem[]> {
    console.log('=== PRODUCT SERVICE - GET MY PRODUCTS ===');
    
    try {
      const result = await apiRequest(API_ENDPOINTS.MY_PRODUCTS);
      console.log('My products retrieved:', {
        count: result?.length || 0,
        hasResults: !!result
      });
      return result;
    } catch (error) {
      console.error('=== PRODUCT SERVICE ERROR ===');
      console.error('Error getting my products:', error);
      
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to view your products.');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const productService = ProductService.getInstance();
export default productService;