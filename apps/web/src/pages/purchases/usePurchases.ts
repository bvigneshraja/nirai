import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Purchase, PaginatedResponse } from '@/types';
import type { PurchaseInput } from '@nirai/schemas';

export function usePurchases(page = 1, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') {
  return useQuery<PaginatedResponse<Purchase>>({
    queryKey: ['purchases', page, search, sortBy, sortOrder],
    queryFn: () => api.get('/purchases', { params: { page, search, sortBy, sortOrder } }).then((r) => r.data),
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseInput) => api.post('/purchases', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
