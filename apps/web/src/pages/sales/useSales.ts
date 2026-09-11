import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Sale, PaginatedResponse } from '@/types';
import type { SaleInput } from '@nirai/schemas';

export function useSales(page = 1, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') {
  return useQuery<PaginatedResponse<Sale>>({
    queryKey: ['sales', page, search, sortBy, sortOrder],
    queryFn: () => api.get('/sales', { params: { page, search, sortBy, sortOrder } }).then((r) => r.data),
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SaleInput) => api.post('/sales', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['balance'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
