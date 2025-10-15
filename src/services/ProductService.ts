import { apiRequest, API_ENDPOINTS } from '../config/api';
import type {
  PaginatedResponse,
  Product,
  ProductFilters,
  ProductListItem,
  ProductReview,
} from '../types/marketplace';
import {
  buildQueryString,
  normalizeProduct,
  normalizeProductCollection,
} from './marketplace/utils';

export type ProductListResponse = PaginatedResponse<ProductListItem> | ProductListItem[];

export class ProductService {
  private static instance: ProductService;

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    const query = buildQueryString(filters);
    const endpoint = query ? `${API_ENDPOINTS.PRODUCTS}?${query}` : API_ENDPOINTS.PRODUCTS;
    const response = await apiRequest<ProductListResponse>(endpoint);
    return normalizeProductCollection(response) ?? [];
  }

  async getProduct(slug: string): Promise<Product> {
    const response = await apiRequest<Product>(API_ENDPOINTS.PRODUCT_DETAIL(slug));
    return normalizeProduct(response);
  }

  async createProduct(productData: FormData): Promise<Product> {
    const response = await apiRequest<Product>(API_ENDPOINTS.PRODUCTS, {
      method: 'POST',
      body: productData,
      headers: {},
    });
    return normalizeProduct(response);
  }

  async updateProduct(slug: string, productData: FormData): Promise<Product> {
    const response = await apiRequest<Product>(API_ENDPOINTS.PRODUCT_DETAIL(slug), {
      method: 'PATCH',
      body: productData,
      headers: {},
    });
    return normalizeProduct(response);
  }

  async deleteProduct(slug: string): Promise<void> {
    await apiRequest<void>(API_ENDPOINTS.PRODUCT_DETAIL(slug), { method: 'DELETE' });
  }

  async trackClick(slug: string): Promise<{ clicked: boolean }> {
    try {
      return await apiRequest<{ clicked: boolean }>(API_ENDPOINTS.PRODUCT_CLICK(slug), { method: 'POST' });
    } catch (error) {
      console.error('Error tracking product click', error);
      return { clicked: false };
    }
  }

  async getProductReviews(slug: string): Promise<ProductReview[]> {
    return apiRequest<ProductReview[]>(API_ENDPOINTS.PRODUCT_REVIEWS(slug));
  }

  async addProductReview(
    slug: string,
    reviewData: { rating: number; title?: string; comment?: string },
  ): Promise<ProductReview> {
    return apiRequest<ProductReview>(API_ENDPOINTS.PRODUCT_ADD_REVIEW, {
      method: 'POST',
      body: JSON.stringify({ ...reviewData, product_slug: slug }),
    });
  }

  async getMyProducts(): Promise<ProductListItem[]> {
    const response = await apiRequest<ProductListItem[]>(API_ENDPOINTS.MY_PRODUCTS);
    const normalized = normalizeProductCollection(response);
    return Array.isArray(normalized) ? normalized : normalized?.results ?? [];
  }
}

export const productService = ProductService.getInstance();
export default productService;
