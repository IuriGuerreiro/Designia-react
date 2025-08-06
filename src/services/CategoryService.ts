import { apiRequest, API_ENDPOINTS } from '../config/api';
import { type Category, type ProductListItem, type ProductFilters } from '../types/marketplace';

export class CategoryService {
  private static instance: CategoryService;

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    console.log('=== CATEGORY SERVICE - GET CATEGORIES ===');
    
    try {
      const result = await apiRequest(API_ENDPOINTS.CATEGORIES);
      console.log('Categories retrieved:', {
        count: result?.length || 0,
        hasResults: !!result
      });
      return result;
    } catch (error) {
      console.error('=== CATEGORY SERVICE ERROR ===');
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Get category by slug
   */
  async getCategory(slug: string): Promise<Category> {
    console.log('=== CATEGORY SERVICE - GET CATEGORY ===');
    console.log('Category slug:', slug);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.CATEGORY_DETAIL(slug));
      console.log('Category retrieved:', {
        name: result?.name,
        slug: result?.slug,
        productCount: result?.product_count
      });
      return result;
    } catch (error) {
      console.error('=== CATEGORY SERVICE ERROR ===');
      console.error('Error getting category:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Category not found.');
      }
      throw error;
    }
  }

  /**
   * Get products in category
   */
  async getCategoryProducts(slug: string, filters?: ProductFilters): Promise<ProductListItem[]> {
    console.log('=== CATEGORY SERVICE - GET CATEGORY PRODUCTS ===');
    console.log('Category slug:', slug);
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
      
      const url = `${API_ENDPOINTS.CATEGORY_PRODUCTS(slug)}${params.toString() ? `?${params.toString()}` : ''}`;
      const result = await apiRequest(url);
      
      console.log('Category products retrieved:', {
        count: result?.length || 0,
        hasResults: !!result
      });
      
      return result;
    } catch (error) {
      console.error('=== CATEGORY SERVICE ERROR ===');
      console.error('Error getting category products:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Category not found.');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const categoryService = CategoryService.getInstance();
export default categoryService;