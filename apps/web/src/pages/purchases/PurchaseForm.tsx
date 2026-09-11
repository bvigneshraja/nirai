import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PurchaseSchema, PurchaseInput } from '@nirai/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  onSubmit: (data: PurchaseInput) => Promise<void>;
  onCancel: () => void;
}

export function PurchaseForm({ onSubmit, onCancel }: Props) {
  const { data: products } = useQuery({
    queryKey: ['products', 1, undefined, undefined, undefined],
    queryFn: () => api.get('/products', { params: { limit: 100 } }).then(r => r.data),
  });

  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<PurchaseInput>({
    resolver: zodResolver(PurchaseSchema),
    defaultValues: { items: [{ productId: '', quantity: 1, unitCost: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' }) ?? [];
  const total = watchedItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0), 0);

  const selectStyle = {
    width: '100%', padding: '9px 12px',
    border: '1px solid rgba(60,60,67,0.2)', borderRadius: 10,
    fontSize: 14, background: 'rgba(120,120,128,0.06)',
    color: '#1C1C1E', outline: 'none',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Supplier (optional)" {...register('supplierId')} />

      {/* Line items */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93', letterSpacing: '0.3px' }}>Items *</label>
          <Button type="button" size="sm" variant="ghost" onClick={() => append({ productId: '', quantity: 1, unitCost: 0 })}>
            <Plus size={13} /> Add item
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fields.map((field, idx) => {
            const prodList = products?.data ?? [];
            const { onChange: productOnChange, ...productRest } = register(`items.${idx}.productId`);
            return (
            <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px 32px', gap: 6, alignItems: 'start' }}>
              <select
                {...productRest}
                style={{ ...selectStyle, padding: '8px 10px' }}
                onChange={e => {
                  const prod = prodList.find((p: any) => p.id === e.target.value);
                  if (prod) setValue(`items.${idx}.unitCost`, prod.defaultCost, { shouldValidate: true });
                  productOnChange(e);
                }}
              >
                <option value="">Product…</option>
                {prodList.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <Input placeholder="Qty" type="number" step="1" min="1" {...register(`items.${idx}.quantity`, { valueAsNumber: true })} />
              <Input placeholder="Cost" type="number" step="0.01" {...register(`items.${idx}.unitCost`, { valueAsNumber: true })} />
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

      <div style={{ background: 'rgba(52,199,89,0.08)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#8E8E93' }}>Total</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#34C759' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>

      <Input label="Notes" {...register('notes')} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save Purchase</Button>
      </div>
    </form>
  );
}
