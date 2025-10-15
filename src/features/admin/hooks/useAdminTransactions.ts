import { useCallback, useState } from 'react';
import { adminService } from '@/features/admin/api/adminService';
import type { TransactionsResponse } from '@/features/admin/model';

export interface AdminTransactionFilters {
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

interface AdminTransactionState {
  data: TransactionsResponse | null;
  loading: boolean;
  error: string | null;
}

export const useAdminTransactions = (pageSize = 50) => {
  const [state, setState] = useState<AdminTransactionState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchTransactions = useCallback(
    async (page: number, filters: AdminTransactionFilters = {}) => {
      setState((previous) => ({ ...previous, loading: true, error: null }));

      try {
        const response = await adminService.getAllTransactions({
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
        const message = error?.message ?? 'Failed to load transactions';
        setState({ data: null, loading: false, error: message });
        throw error;
      }
    },
    [pageSize],
  );

  return {
    transactions: state.data?.transactions ?? [],
    summary: state.data?.summary ?? null,
    pagination: state.data?.pagination ?? null,
    loading: state.loading,
    error: state.error,
    fetchTransactions,
  };
};
