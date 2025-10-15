import { useState, useCallback } from 'react';
import { favoriteService } from '../api';
import type { ProductListItem } from '@/features/marketplace/model';

interface UseFavoritesReturn {
  favorites: { product: ProductListItem }[];
  loading: boolean;
  error: string | null;
  toggleFavorite: (productSlug: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  isProductFavorited: (productId: string) => boolean;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<{ product: ProductListItem }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userFavorites = await favoriteService.getFavorites();
      setFavorites(userFavorites);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load favorites';
      setError(errorMessage);
      console.error('Error refreshing favorites:', err);

      if (errorMessage.includes('Authentication required')) {
        setFavorites([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (productSlug: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await favoriteService.toggleFavorite(productSlug);

      setFavorites(prev => {
        if (response.favorited) {
          return prev;
        }

        return prev.filter(fav => fav.product.slug !== productSlug);
      });

      await refreshFavorites();
      return response.favorited;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle favorite';
      setError(errorMessage);
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, [refreshFavorites]);

  const isProductFavorited = useCallback((productId: string): boolean => {
    return favorites.some(fav => fav.product.id === productId);
  }, [favorites]);

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    refreshFavorites,
    isProductFavorited,
  };
};

export default useFavorites;
