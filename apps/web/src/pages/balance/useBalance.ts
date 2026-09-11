import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { CustomerBalance, PaginatedResponse } from '@/types';
import type { CreditInput } from '@nirai/schemas';

export function useBalances(page = 1, sortBy?: string, sortOrder?: 'asc' | 'desc') {
  return useQuery<PaginatedResponse<CustomerBalance>>({
    queryKey: ['balance', page, sortBy, sortOrder],
    queryFn: () => api.get('/balances', { params: { page, sortBy, sortOrder } }).then((r) => r.data),
  });
}

export function useCreditBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: CreditInput }) =>
      api.post(`/balances/${customerId}/credit`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['balance'] }),
  });
}
