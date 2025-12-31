import apiClient from '@/shared/api/axios'
import type {
  SellerApplication,
  SellerApplicationStatus,
  SellerApplicationSubmitResponse,
} from '../types/application'

export const getApplicationStatus = async (): Promise<SellerApplicationStatus> => {
  const response = await apiClient.get('/auth/seller/application/status/')
  return response.data
}

export const submitApplication = async (
  data: SellerApplication
): Promise<SellerApplicationSubmitResponse> => {
  // The API expects multipart/form-data for file uploads
  const formData = new FormData()
  formData.append('business_name', data.business_name)
  formData.append('motivation', data.motivation)
  formData.append('seller_type', data.seller_type)

  if (data.portfolio_url) {
    formData.append('portfolio_url', data.portfolio_url)
  }

  if (data.shop_logo) {
    formData.append('shop_logo', data.shop_logo)
  }

  if (data.uploaded_images && Array.isArray(data.uploaded_images)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.uploaded_images.forEach((photo: any) => {
      formData.append('uploaded_images', photo)
    })
  }

  const response = await apiClient.post('/auth/seller/apply/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}
