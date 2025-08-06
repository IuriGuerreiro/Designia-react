import { useState, useCallback } from 'react';
import { favoriteService } from '../services';
import { type ProductListItem } from '../types/marketplace';

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
      
      // Clear favorites on auth error
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
      
      // Update local state optimistically
      setFavorites(prev => {
        if (response.favorited) {
          // Note: We would need the full product data to add to favorites
          // For now, we'll just refresh the list
          return prev;
        } else {
          // Remove from favorites
          return prev.filter(fav => fav.product.slug !== productSlug);
        }
      });
      
      // Refresh the full list to get accurate data
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