import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { ProductForm } from './ProductForm';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from './useProducts';
import { useToast } from '@/components/ui/Toast';
import { Product } from '@/types';
import type { ProductInput } from '@nirai/schemas';

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useProducts(page, search || undefined, sortBy, sortOrder);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const { toast } = useToast();

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('asc'); }
    setPage(1);
  };

  const handleSubmit = async (formData: ProductInput) => {
    try {
      if (selected) await updateMutation.mutateAsync({ id: selected.id, data: formData });
      else await createMutation.mutateAsync(formData);
      setShowForm(false);
      toast(selected ? 'Product updated' : 'Product saved');
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast('Product deleted');
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Product Name', sortable: true },
    { key: 'unit', header: 'Unit' },
    { key: 'defaultCost', header: 'Default Cost', sortable: true, render: (r: Product) => `₹${Number(r.defaultCost).toFixed(2)}` },
    { key: 'stock', header: 'Stock', sortable: true, render: (r: Product) => (
      <Badge label={`${r.stock} ${r.unit}`} variant={r.stock <= 5 ? 'danger' : r.stock <= 20 ? 'warning' : 'success'} />
    )},
    { key: 'actions', header: '', render: (r: Product) => (
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        <Button size="sm" variant="ghost" onClick={() => { setSelected(r); setShowForm(true); }}>
          <Pencil size={14} strokeWidth={1.8} />
        </Button>
        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(r)}>
          <Trash2 size={14} strokeWidth={1.8} />
        </Button>
      </div>
    )},
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <input
          type="search"
          placeholder="Search products…"
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
          <p style={{ fontSize: 13, color: '#8E8E93', margin: 0 }}>{data?.total ?? 0} products</p>
          <Button onClick={() => { setSelected(null); setShowForm(true); }}>
            <Plus size={16} strokeWidth={2} /> Add Product
          </Button>
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
      <Modal open={showForm} onClose={() => setShowForm(false)} title={selected ? 'Edit Product' : 'Add Product'}>
        <ProductForm defaultValues={selected ?? undefined} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
