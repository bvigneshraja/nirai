import { useState } from 'react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { useBalances, useCreditBalance } from './useBalance';
import { useToast } from '@/components/ui/Toast';
import { CustomerBalance } from '@/types';

export function BalancePage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [payTarget, setPayTarget] = useState<CustomerBalance | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const { data, isLoading } = useBalances(page, sortBy, sortOrder);
  const creditMutation = useCreditBalance();
  const { toast } = useToast();

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortOrder('asc'); }
    setPage(1);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTarget) return;
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    try {
      await creditMutation.mutateAsync({ customerId: payTarget.customerId, data: { amount, description: 'Payment received' } });
      setPayTarget(null);
      setPayAmount('');
      toast('Payment recorded');
    } catch {
      toast('Something went wrong', 'error');
    }
  };

  const columns: Column<CustomerBalance>[] = [
    { key: 'customer', header: 'Customer Name', render: (r: CustomerBalance) => r.customer?.name ?? '-' },
    { key: 'stockOnHold', header: 'Stock on Hold', render: (r: CustomerBalance) => r.stockOnHold },
    {
      key: 'amountDue',
      header: 'Amount Due (₹)',
      sortable: true,
      render: (r: CustomerBalance) => (
        <span style={{ fontWeight: 600, color: r.amountDue > 0 ? '#FF3B30' : '#34C759' }}>
          ₹{Number(r.amountDue).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'costValue',
      header: 'Cost Value (₹)',
      render: (r: CustomerBalance) => `₹${Number(r.costValue).toFixed(2)}`,
    },
    {
      key: 'expectedProfit',
      header: 'Expected Profit',
      sortable: true,
      render: (r: CustomerBalance) => {
        const pct = r.amountDue > 0 ? (r.expectedProfit / r.amountDue) * 100 : 0;
        const color = r.expectedProfit >= 0 ? '#34C759' : '#FF3B30';
        return (
          <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
            ₹{Number(r.expectedProfit).toFixed(2)}
            <span style={{ fontSize: 11, opacity: 0.75, marginLeft: 4 }}>
              ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
            </span>
          </span>
        );
      },
    },
    {
      key: 'creditLimit',
      header: 'Credit Limit',
      sortable: true,
      render: (r: CustomerBalance) => r.creditLimit,
    },
    {
      key: 'capacityBalance',
      header: 'Credit Balance',
      render: (r: CustomerBalance) => (
        <span style={{ color: r.capacityBalance >= 0 ? '#34C759' : '#FF3B30' }}>
          ₹{Number(r.capacityBalance).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r: CustomerBalance) => (
        <Button size="sm" variant="ghost" onClick={() => { setPayTarget(r); setPayAmount(''); }}>
          Record Payment
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: '#8E8E93', margin: 0 }}>{data?.total ?? 0} customers</p>
      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        keyExtractor={(r) => r.customerId}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
      <Pagination page={page} total={data?.total ?? 0} limit={20} onChange={setPage} />

      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title={`Record Payment — ${payTarget?.customer?.name ?? ''}`} width={380}>
        <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(255,59,48,0.06)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#8E8E93' }}>Outstanding</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#FF3B30' }}>
              ₹{Number(payTarget?.amountDue ?? 0).toFixed(2)}
            </span>
          </div>
          <Input
            label="Amount Received (₹) *"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
            <Button type="button" variant="secondary" onClick={() => setPayTarget(null)}>Cancel</Button>
            <Button type="submit" loading={creditMutation.isPending}>Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
