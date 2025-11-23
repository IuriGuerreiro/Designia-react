import { apiRequest, API_ENDPOINTS } from '@/shared/api';

export interface ProductARModelResponse {
  id: number;
  product_id: string;
  s3_key: string;
  original_filename: string;
  file_size?: number;
  content_type?: string;
  uploaded_at: string;
}

class ArModelService {
  private static instance: ArModelService;

  public static getInstance(): ArModelService {
    if (!ArModelService.instance) {
      ArModelService.instance = new ArModelService();
    }
    return ArModelService.instance;
  }

  async uploadProductModel(productId: string, modelFile: File): Promise<ProductARModelResponse> {
    const payload = new FormData();
    payload.append('product_id', productId);
    payload.append('model_file', modelFile);

    return apiRequest<ProductARModelResponse>(API_ENDPOINTS.AR_MODELS, {
      method: 'POST',
      body: payload,
      headers: {},
    });
  }
}

export const arModelService = ArModelService.getInstance();
export default arModelService;
