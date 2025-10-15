import { apiRequest, API_ENDPOINTS } from '../../../shared/api';
import type { ProductListItem } from '@/features/marketplace/model';

export class FavoriteService {
  private static instance: FavoriteService;

  public static getInstance(): FavoriteService {
    if (!FavoriteService.instance) {
      FavoriteService.instance = new FavoriteService();
    }
    return FavoriteService.instance;
  }

  async toggleFavorite(productSlug: string): Promise<{ favorited: boolean }> {
    return apiRequest<{ favorited: boolean }>(API_ENDPOINTS.PRODUCT_FAVORITE(productSlug), {
      method: 'POST',
    });
  }

  async getFavorites(): Promise<{ product: ProductListItem }[]> {
    return apiRequest<{ product: ProductListItem }[]>(API_ENDPOINTS.FAVORITES);
  }

  async addToFavorites(productSlug: string): Promise<{ favorited: boolean }> {
    const result = await this.toggleFavorite(productSlug);
    return result.favorited ? result : this.toggleFavorite(productSlug);
  }

  async removeFromFavorites(productSlug: string): Promise<{ favorited: boolean }> {
    const result = await this.toggleFavorite(productSlug);
    return result.favorited ? this.toggleFavorite(productSlug) : result;
  }
}

export const favoriteService = FavoriteService.getInstance();
export default favoriteService;
