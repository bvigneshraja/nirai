import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { PurchaseForm } from './PurchaseForm';
import { usePurchases, useCreatePurchase } from './usePurchases';
import { useToast } from '@/components/ui/Toast';
import { Purchase } from '@/types';
import type { PurchaseInput } from '@nirai/schemas';

export function PurchasesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = usePurchases(page, search || undefined, sortBy, sortOrder);
  const createMutation = useCreatePurchase();
  const { toast } = useToast();

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('desc'); }
    setPage(1);
  };

  const handleSubmit = async (data: PurchaseInput) => {
    try {
      await createMutation.mutateAsync(data);
      setShowForm(false);
      toast('Purchase recorded');
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  type PurchaseRow = {
    rowId: string;
    purchaseId: string;
    purchasedAt: string;
    productName: string;
    quantity: number;
    unitCost: number;
    total: number;
  };

  const rows: PurchaseRow[] = (data?.data ?? []).flatMap((p: Purchase) =>
    (p.items ?? []).map(item => ({
      rowId: `${p.id}-${item.id}`,
      purchaseId: p.id,
      purchasedAt: p.purchasedAt,
      productName: item.product?.name ?? '-',
      quantity: item.quantity,
      unitCost: item.unitCost,
      total: item.subtotal ?? item.quantity * item.unitCost,
    }))
  );

  const columns: Column<PurchaseRow>[] = [
    {
      key: 'purchasedAt',
      header: 'Purchase Date',
      sortable: true,
      render: (r: PurchaseRow) => new Date(r.purchasedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      key: 'purchaseId',
      header: 'Purchase ID',
      render: (r: PurchaseRow) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#8E8E93' }}>{r.purchaseId.slice(0, 8)}…</span>
      ),
    },
    {
      key: 'productName',
      header: 'Product Name',
      render: (r: PurchaseRow) => <span style={{ fontWeight: 500 }}>{r.productName}</span>,
    },
    {
      key: 'quantity',
      header: 'Qty',
      sortable: true,
      render: (r: PurchaseRow) => r.quantity,
    },
    {
      key: 'unitCost',
      header: 'Purchase Price (₹)',
      sortable: true,
      render: (r: PurchaseRow) => `₹${Number(r.unitCost).toLocaleString('en-IN')}`,
    },
    {
      key: 'total',
      header: 'Total Purchase (₹)',
      sortable: true,
      render: (r: PurchaseRow) => (
        <span style={{ fontWeight: 600 }}>₹{Number(r.total).toLocaleString('en-IN')}</span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <input
          type="search"
          placeholder="Search purchases…"
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
          <p style={{ fontSize: 13, color: '#8E8E93', margin: 0 }}>{data?.total ?? 0} purchases</p>
          <Button onClick={() => setShowForm(true)}><Plus size={16} /> New Purchase</Button>
        </div>
      </div>
      <Table
        columns={columns}
        data={rows}
        loading={isLoading}
        keyExtractor={(r) => r.rowId}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      <Pagination page={page} total={data?.total ?? 0} limit={20} onChange={setPage} />
      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Purchase" width={560}>
        <PurchaseForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
