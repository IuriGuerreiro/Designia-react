import { apiRequest, API_ENDPOINTS } from '../config/api';
import { type Category, type ProductListItem, type ProductFilters } from '../types/marketplace';

/**
 * Helper function to assimilate image URLs for better display
 * Ensures the best available image URL is used with proper fallback chain
 */
const assimilateImageUrl = (imageData: any): any => {
  if (!imageData) return imageData;
  
  // If it's an array of images, process each one
  if (Array.isArray(imageData)) {
    return imageData.map(img => assimilateImageUrl(img));
  }
  
  // Process single image object
  const processedImage = { ...imageData };
  
  // Determine the best available URL following priority: presigned_url > image_url > image
  let bestUrl = '/placeholder-product.png';
  let urlSource = 'placeholder';
  
  if (processedImage.presigned_url && processedImage.presigned_url !== 'null' && processedImage.presigned_url !== null) {
    bestUrl = processedImage.presigned_url;
    urlSource = 'presigned_url';
  } else if (processedImage.image_url && processedImage.image_url !== 'null' && processedImage.image_url !== null) {
    bestUrl = processedImage.image_url;
    urlSource = 'image_url';
  } else if (processedImage.image && processedImage.image !== 'null' && processedImage.image !== null) {
    bestUrl = processedImage.image;
    urlSource = 'image';
  }
  
  // Store the best URL in a standardized field for easy access
  processedImage.display_url = bestUrl;
  processedImage.url_source = urlSource;
  
  return processedImage;
};

/**
 * Helper function to process product data and assimilate image URLs
 */
const assimilateProductImages = (product: any): any => {
  if (!product) return product;
  
  const processedProduct = { ...product };
  
  // Process primary_image
  if (processedProduct.primary_image) {
    processedProduct.primary_image = assimilateImageUrl(processedProduct.primary_image);
  }
  
  // Process images array
  if (processedProduct.images && Array.isArray(processedProduct.images)) {
    processedProduct.images = assimilateImageUrl(processedProduct.images);
  }
  

  return processedProduct;
};

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
      
      // Process and assimilate image URLs for all category products
      if (result && Array.isArray(result) && result.length > 0) {
        const processedProducts = result.map((product: any) => assimilateProductImages(product));
        return processedProducts;
      }
      
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