import { useState } from 'react';
import { Plus, Pencil, Trash2, EyeOff } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { CustomerForm } from './CustomerForm';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from './useCustomers';
import { useToast } from '@/components/ui/Toast';
import { Customer } from '@/types';
import type { CustomerInput } from '@nirai/schemas';

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const { isSuperAdmin } = useRole();
  const { data, isLoading } = useCustomers(page, search || undefined, sortBy, sortOrder);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const { toast } = useToast();

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('asc'); }
    setPage(1);
  };

  const handleSubmit = async (formData: CustomerInput) => {
    try {
      if (selected) await updateMutation.mutateAsync({ id: selected.id, data: formData });
      else await createMutation.mutateAsync(formData);
      setShowForm(false);
      toast(selected ? 'Customer updated' : 'Customer saved');
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast('Customer deleted');
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  const columns: Column<Customer>[] = [
    { key: 'name', header: 'Customer Name', sortable: true },
    { key: 'contactPerson', header: 'Contact Person' },
    {
      key: 'phone',
      header: 'Phone',
      render: (row: Customer) =>
        isSuperAdmin ? (
          <span>{row.phone ?? '—'}</span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8E8E93', fontSize: 13 }}>
            <EyeOff size={12} />
            {row.phone ?? '—'}
          </span>
        ),
    },
    { key: 'location', header: 'Location', sortable: true },
    {
      key: 'creditLimit',
      header: 'Credit Limit',
      sortable: true,
      render: (row: Customer) => (
        <span style={{ fontSize: 13, color: row.creditLimit != null ? '#1C1C1E' : '#8E8E93', fontVariantNumeric: 'tabular-nums' }}>
          {row.creditLimit != null ? row.creditLimit.toLocaleString('en-IN') : '—'}
        </span>
      ),
    },
    ...(isSuperAdmin ? [{
      key: 'actions',
      header: '',
      render: (row: Customer) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="ghost" onClick={() => { setSelected(row); setShowForm(true); }}>
            <Pencil size={14} strokeWidth={1.8} />
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
            <Trash2 size={14} strokeWidth={1.8} />
          </Button>
        </div>
      ),
    }] : []) as Column<Customer>[],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <input
          type="search"
          placeholder="Search customers…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            width: '100%', maxWidth: 280, padding: '8px 12px',
            border: '1px solid rgba(60,60,67,0.2)', borderRadius: 10,
            fontSize: 14, background: 'rgba(120,120,128,0.08)', outline: 'none',
            color: '#1C1C1E',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#8E8E93', margin: 0 }}>{data?.total ?? 0} customers</p>
          {isSuperAdmin && (
            <Button onClick={() => { setSelected(null); setShowForm(true); }}>
              <Plus size={15} strokeWidth={2} /> Add Customer
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        keyExtractor={(r) => r.id}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <Pagination page={page} total={data?.total ?? 0} limit={20} onChange={setPage} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={selected ? 'Edit Customer' : 'New Customer'}>
        <CustomerForm defaultValues={selected ?? undefined} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
