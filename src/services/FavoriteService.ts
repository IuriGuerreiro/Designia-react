import { apiRequest, API_ENDPOINTS } from '../config/api';
import { type ProductListItem } from '../types/marketplace';

export class FavoriteService {
  private static instance: FavoriteService;

  public static getInstance(): FavoriteService {
    if (!FavoriteService.instance) {
      FavoriteService.instance = new FavoriteService();
    }
    return FavoriteService.instance;
  }

  /**
   * Toggle favorite for a product
   */
  async toggleFavorite(productSlug: string): Promise<{ favorited: boolean }> {
    console.log('=== FAVORITE SERVICE - TOGGLE FAVORITE ===');
    console.log('Product slug:', productSlug);
    
    try {
      const result = await apiRequest(API_ENDPOINTS.PRODUCT_FAVORITE(productSlug), {
        method: 'POST',
      });
      
      console.log('Favorite toggle result:', result);
      return result;
    } catch (error) {
      console.error('=== FAVORITE SERVICE ERROR ===');
      console.error('Error toggling favorite:', error);
      
      // Re-throw with enhanced error information
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new Error('Authentication required. Please log in to manage favorites.');
        } else if (error.message.includes('404')) {
          throw new Error('Product not found.');
        } else if (error.message.includes('500')) {
          throw new Error('Server error. Please try again later.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get user's favorites
   */
  async getFavorites(): Promise<{ product: ProductListItem }[]> {
    console.log('=== FAVORITE SERVICE - GET FAVORITES ===');
    
    try {
      const result = await apiRequest(API_ENDPOINTS.FAVORITES);
      console.log('Favorites retrieved:', {
        count: result?.length || 0,
        hasResults: !!result
      });
      return result;
    } catch (error) {
      console.error('=== FAVORITE SERVICE ERROR ===');
      console.error('Error getting favorites:', error);
      
      // Handle authentication error
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Authentication required. Please log in to view favorites.');
      }
      
      throw error;
    }
  }

  /**
   * Check if product is favorited by user
   */
  async isProductFavorited(productId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.product.id === productId);
    } catch (error) {
      console.error('Error checking if product is favorited:', error);
      return false; // Return false if we can't determine favorite status
    }
  }

  /**
   * Add product to favorites
   */
  async addToFavorites(productSlug: string): Promise<{ favorited: boolean }> {
    console.log('=== FAVORITE SERVICE - ADD TO FAVORITES ===');
    console.log('Product slug:', productSlug);
    
    try {
      // Check if already favorited first
      const result = await this.toggleFavorite(productSlug);
      
      // If not favorited after toggle, toggle again to add
      if (!result.favorited) {
        return await this.toggleFavorite(productSlug);
      }
      
      return result;
    } catch (error) {
      console.error('=== FAVORITE SERVICE ERROR ===');
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove product from favorites
   */
  async removeFromFavorites(productSlug: string): Promise<{ favorited: boolean }> {
    console.log('=== FAVORITE SERVICE - REMOVE FROM FAVORITES ===');
    console.log('Product slug:', productSlug);
    
    try {
      // Check if already favorited first
      const result = await this.toggleFavorite(productSlug);
      
      // If still favorited after toggle, toggle again to remove
      if (result.favorited) {
        return await this.toggleFavorite(productSlug);
      }
      
      return result;
    } catch (error) {
      console.error('=== FAVORITE SERVICE ERROR ===');
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const favoriteService = FavoriteService.getInstance();
export default favoriteService;