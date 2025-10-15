import { useCallback, useState } from 'react';
import { adminService } from '@/features/admin/api/adminService';
import type { PayoutsResponse } from '@/features/admin/model';

export interface AdminPayoutFilters {
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

interface AdminPayoutState {
  data: PayoutsResponse | null;
  loading: boolean;
  error: string | null;
}

export const useAdminPayouts = (pageSize = 50) => {
  const [state, setState] = useState<AdminPayoutState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchPayouts = useCallback(
    async (page: number, filters: AdminPayoutFilters = {}) => {
      setState((previous) => ({ ...previous, loading: true, error: null }));

      try {
        const response = await adminService.getAllPayouts({
          page_size: pageSize,
          offset: page * pageSize,
          status: filters.status,
          search: filters.search,
          from_date: filters.fromDate,
          to_date: filters.toDate,
        });

        setState({ data: response, loading: false, error: null });
        return response;
      } catch (error: any) {
        const message = error?.message ?? 'Failed to load payouts';
        setState({ data: null, loading: false, error: message });
        throw error;
      }
    },
    [pageSize],
  );

  return {
    payouts: state.data?.payouts ?? [],
    summary: state.data?.summary ?? null,
    pagination: state.data?.pagination ?? null,
    loading: state.loading,
    error: state.error,
    fetchPayouts,
  };
};
