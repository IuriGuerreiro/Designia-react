import apiClient from '@/shared/api/axios'
import type { SellerAnalytics, AnalyticsPeriod } from '../types'

const BASE_URL = '/marketplace/seller'

export const getSellerAnalytics = async (
  period: AnalyticsPeriod = 'all'
): Promise<SellerAnalytics> => {
  const response = await apiClient.get(`${BASE_URL}/analytics/`, {
    params: { period },
  })
  return response.data
}
