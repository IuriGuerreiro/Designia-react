import { useQuery } from '@tanstack/react-query'
import { getSellerAnalytics } from '../api/analyticsApi'
import type { AnalyticsPeriod } from '../types'

export const useSellerAnalytics = (period: AnalyticsPeriod = 'all') => {
  return useQuery({
    queryKey: ['seller-analytics', period],
    queryFn: () => getSellerAnalytics(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
