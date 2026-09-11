import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaleSchema, SaleInput } from '@nirai/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  onSubmit: (data: SaleInput) => Promise<void>;
  onCancel: () => void;
}

export function SaleForm({ onSubmit, onCancel }: Props) {
  const { data: customers } = useQuery({
    queryKey: ['customers', 1, undefined, undefined, undefined],
    queryFn: () => api.get('/customers', { params: { limit: 100 } }).then(r => r.data),
  });
  const { data: products } = useQuery({
    queryKey: ['products', 1, undefined, undefined, undefined],
    queryFn: () => api.get('/products', { params: { limit: 100 } }).then(r => r.data),
  });

  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<SaleInput>({
    resolver: zodResolver(SaleSchema),
    defaultValues: { items: [{ productId: '', quantity: 1, unitPrice: 0 }], paidAmount: 0 },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchedItems = useWatch({ control, name: 'items' }) ?? [];
  const total = watchedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);

  const selectStyle = {
    width: '100%', padding: '9px 12px',
    border: '1px solid rgba(60,60,67,0.2)', borderRadius: 10,
    fontSize: 14, background: 'rgba(120,120,128,0.06)',
    color: '#1C1C1E', outline: 'none',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Customer */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93', letterSpacing: '0.3px', display: 'block', marginBottom: 4 }}>Customer *</label>
        <select {...register('customerId')} style={selectStyle}>
          <option value="">Select customer…</option>
          {customers?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.customerId && <p style={{ fontSize: 12, color: '#FF3B30', marginTop: 3 }}>{errors.customerId.message}</p>}
      </div>

      {/* Line items */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93', letterSpacing: '0.3px' }}>Items *</label>
          <Button type="button" size="sm" variant="ghost" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}>
            <Plus size={13} /> Add item
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fields.map((field, idx) => {
            const prodList = products?.data ?? [];
            const { onChange: productOnChange, ...productRest } = register(`items.${idx}.productId`);
            return (
              <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px 32px', gap: 6, alignItems: 'start' }}>
                <div>
                  <select
                    {...productRest}
                    style={{ ...selectStyle, padding: '8px 10px' }}
                    onChange={e => {
                      const prod = prodList.find((p: any) => p.id === e.target.value);
                      if (prod) setValue(`items.${idx}.unitPrice`, prod.defaultCost);
                      productOnChange(e);
                    }}
                  >
                    <option value="">Product…</option>
                    {prodList.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <Input placeholder="Qty" type="number" step="1" min="1" {...register(`items.${idx}.quantity`, { valueAsNumber: true })} />
                <Input placeholder="Price" type="number" step="0.01" {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })} />
                <button type="button" onClick={() => remove(idx)} disabled={fields.length === 1}
                  style={{ background: 'none', border: 'none', color: '#FF3B30', cursor: fields.length === 1 ? 'not-allowed' : 'pointer', opacity: fields.length === 1 ? 0.3 : 1, padding: '8px 4px' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
        {errors.items && <p style={{ fontSize: 12, color: '#FF3B30', marginTop: 3 }}>At least one item required</p>}
      </div>

      {/* Total display */}
      <div style={{ background: 'rgba(0,122,255,0.06)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#8E8E93' }}>Total</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#007AFF' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Paid amount + Date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Paid Amount" type="number" step="0.01" placeholder="0" {...register('paidAmount', { valueAsNumber: true })} />
        <Input label="Sale Date" type="datetime-local" {...register('soldAt')} />
      </div>

      <Input label="Notes" {...register('notes')} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Sale</Button>
      </div>
    </form>
  );
}
