import { apiRequest } from '@/shared/api';
import type { SellerApplicationPayload, SellerApplicationResponse, SellerApplicationStatusResponse } from '@/features/auth/api/types';

// Seller application API for the Account feature

export const submitSellerApplication = (payload: SellerApplicationPayload) => {
  const formData = new FormData();
  formData.append('businessName', payload.businessName);
  formData.append('sellerType', payload.sellerType);
  formData.append('motivation', payload.motivation);
  formData.append('portfolio', payload.portfolio);

  if (payload.socialMedia) {
    formData.append('socialMedia', payload.socialMedia);
  }

  payload.workshopPhotos.forEach((file) => {
    formData.append('workshopPhotos', file);
  });

  return apiRequest<SellerApplicationResponse>('SELLER_APPLICATION_APPLY', {
    method: 'POST',
    body: formData,
  });
};

export const fetchSellerApplicationStatus = () =>
  apiRequest<SellerApplicationStatusResponse>('SELLER_APPLICATION_STATUS');

