import { apiRequest, API_ENDPOINTS } from '../../../shared/api';
import type { Category, ProductFilters, ProductListItem } from '@/features/marketplace/model';
import { buildQueryString, normalizeProductCollection } from './utils';

export class CategoryService {
  private static instance: CategoryService;

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  async getCategories(): Promise<Category[]> {
    return apiRequest<Category[]>(API_ENDPOINTS.CATEGORIES);
  }

  async getCategory(slug: string): Promise<Category> {
    return apiRequest<Category>(API_ENDPOINTS.CATEGORY_DETAIL(slug));
  }

  async getCategoryProducts(slug: string, filters?: ProductFilters): Promise<ProductListItem[]> {
    const query = buildQueryString(filters);
    const endpoint = `${API_ENDPOINTS.CATEGORY_PRODUCTS(slug)}${query ? `?${query}` : ''}`;
    const response = await apiRequest<ProductListItem[]>(endpoint);
    const normalized = normalizeProductCollection(response);
    return Array.isArray(normalized) ? normalized : normalized?.results ?? [];
  }
}

export const categoryService = CategoryService.getInstance();
export default categoryService;
