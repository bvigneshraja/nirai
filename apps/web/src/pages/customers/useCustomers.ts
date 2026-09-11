import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Customer, PaginatedResponse } from '@/types';
import type { CustomerInput } from '@nirai/schemas';

export function useCustomers(page = 1, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') {
  return useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers', page, search, sortBy, sortOrder],
    queryFn: () => api.get('/customers', { params: { page, search, sortBy, sortOrder } }).then((r) => r.data),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerInput) => api.post('/customers', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerInput> }) =>
      api.patch(`/customers/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}
