import { useCallback, useState } from 'react';
import { apiRequest, API_ENDPOINTS } from '@/shared/api';
import type { SellerApplication, SellerApplicationStatus } from '@/features/admin/model';

interface SellerApplicationState {
  data: SellerApplication[];
  loading: boolean;
  error: string | null;
}

export const useSellerApplications = () => {
  const [state, setState] = useState<SellerApplicationState>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchApplications = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));

    try {
      const response = await apiRequest(API_ENDPOINTS.ADMIN_SELLER_APPLICATIONS);
      setState({ data: response, loading: false, error: null });
      return response as SellerApplication[];
    } catch (error: any) {
      const message = error?.message ?? 'Failed to fetch applications';
      setState({ data: [], loading: false, error: message });
      throw error;
    }
  }, []);

  const updateStatus = useCallback(
    async (id: number, action: 'approve' | 'reject', payload?: { reason?: string }) => {
      const endpoint =
        action === 'approve'
          ? API_ENDPOINTS.ADMIN_APPROVE_SELLER(id)
          : API_ENDPOINTS.ADMIN_REJECT_SELLER(id);

      await apiRequest(endpoint, {
        method: 'POST',
        body: payload ? JSON.stringify(payload) : undefined,
      });

      await fetchApplications();
    },
    [fetchApplications],
  );

  const filterByStatus = (status: SellerApplicationStatus | 'all') => {
    if (status === 'all') {
      return state.data;
    }

    return state.data.filter((application) => application.status === status);
  };

  return {
    applications: state.data,
    loading: state.loading,
    error: state.error,
    fetchApplications,
    updateStatus,
    filterByStatus,
  };
};
