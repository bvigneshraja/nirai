import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { SaleForm } from './SaleForm';
import { useSales, useCreateSale } from './useSales';
import { useToast } from '@/components/ui/Toast';
import { Sale } from '@/types';
import type { SaleInput } from '@nirai/schemas';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PAID: 'success', PARTIAL: 'warning', PENDING: 'default', CANCELLED: 'danger',
};

export function SalesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useSales(page, search || undefined, sortBy, sortOrder);
  const createMutation = useCreateSale();
  const { toast } = useToast();

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('desc'); }
    setPage(1);
  };

  const handleSubmit = async (data: SaleInput) => {
    try {
      await createMutation.mutateAsync(data);
      setShowForm(false);
      toast('Sale recorded');
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  type SaleRow = {
    rowId: string;
    saleId: string;
    soldAt: string;
    customerName: string;
    productName: string;
    quantity: number;
    costPerUnit: number;
    unitPrice: number;
    totalSale: number;
    status: Sale['status'];
  };

  const rows: SaleRow[] = (data?.data ?? []).flatMap((s: Sale) =>
    (s.items ?? []).map(item => {
      const cost = (item.product as any)?.defaultCost ?? 0;
      return {
        rowId: `${s.id}-${item.id}`,
        saleId: s.id,
        soldAt: s.soldAt,
        customerName: s.customer?.name ?? '-',
        productName: item.product?.name ?? '-',
        quantity: item.quantity,
        costPerUnit: cost,
        unitPrice: item.unitPrice,
        totalSale: item.quantity * item.unitPrice,
        status: s.status,
      };
    })
  );

  const columns: Column<SaleRow>[] = [
    {
      key: 'soldAt',
      header: 'Sale Date',
      sortable: true,
      render: (r: SaleRow) => new Date(r.soldAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      key: 'saleId',
      header: 'Sale ID',
      render: (r: SaleRow) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#8E8E93' }}>{r.saleId.slice(0, 8)}…</span>,
    },
    {
      key: 'customerName',
      header: 'Customer Name',
      render: (r: SaleRow) => <span style={{ fontWeight: 500 }}>{r.customerName}</span>,
    },
    {
      key: 'productName',
      header: 'Product Name',
      render: (r: SaleRow) => r.productName,
    },
    {
      key: 'quantity',
      header: 'Qty',
      sortable: true,
      render: (r: SaleRow) => r.quantity,
    },
    {
      key: 'costPerUnit',
      header: 'Cost/Unit',
      render: (r: SaleRow) => `₹${Number(r.costPerUnit).toLocaleString('en-IN')}`,
    },
    {
      key: 'unitPrice',
      header: 'Selling Price/Unit',
      sortable: true,
      render: (r: SaleRow) => `₹${Number(r.unitPrice).toLocaleString('en-IN')}`,
    },
    {
      key: 'margin',
      header: 'Margin/Unit',
      render: (r: SaleRow) => {
        const m = r.unitPrice - r.costPerUnit;
        const pct = r.costPerUnit > 0 ? (m / r.costPerUnit) * 100 : 0;
        const color = m >= 0 ? '#34C759' : '#FF3B30';
        return (
          <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
            ₹{m.toLocaleString('en-IN')}
            <span style={{ fontSize: 11, opacity: 0.75, marginLeft: 4 }}>({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)</span>
          </span>
        );
      },
    },
    {
      key: 'totalSale',
      header: 'Total Sale (₹)',
      sortable: true,
      render: (r: SaleRow) => <span style={{ fontWeight: 600 }}>₹{Number(r.totalSale).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'totalMargin',
      header: 'Total Margin',
      sortable: true,
      render: (r: SaleRow) => {
        const totalCost = r.quantity * r.costPerUnit;
        const margin = r.totalSale - totalCost;
        const pct = totalCost > 0 ? (margin / totalCost) * 100 : 0;
        const color = margin >= 0 ? '#34C759' : '#FF3B30';
        return (
          <span style={{ color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            ₹{margin.toLocaleString('en-IN')}
            <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginLeft: 4 }}>
              ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
            </span>
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r: SaleRow) => <Badge label={r.status} variant={statusVariant[r.status]} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <input
          type="search"
          placeholder="Search by customer…"
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
          <p style={{ fontSize: 13, color: '#8E8E93', margin: 0 }}>{data?.total ?? 0} sales</p>
          <Button onClick={() => setShowForm(true)}><Plus size={16} /> New Sale</Button>
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
      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Sale" width={560}>
        <SaleForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
