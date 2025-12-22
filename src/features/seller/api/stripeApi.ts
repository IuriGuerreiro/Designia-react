import apiClient from '@/shared/api/axios'
import type { StripeAccountStatus } from '../types/stripe'

export const getStripeAccountStatus = async (): Promise<StripeAccountStatus> => {
  const response = await apiClient.get('/payments/stripe/account-status/')
  return response.data
}
