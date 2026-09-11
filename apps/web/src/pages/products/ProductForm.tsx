import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductSchema, ProductInput } from '@nirai/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types';

interface Props {
  defaultValues?: Partial<Product>;
  onSubmit: (data: ProductInput) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ defaultValues, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductInput>({
    resolver: zodResolver(ProductSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Product Name *" error={errors.name?.message} {...register('name')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Unit" placeholder="pcs" error={errors.unit?.message} {...register('unit')} />
        <Input label="Default Cost (₹) *" type="number" step="0.01" error={errors.defaultCost?.message} {...register('defaultCost', { valueAsNumber: true })} />
      </div>
      <Input label="Opening Stock" type="number" error={errors.stock?.message} {...register('stock', { valueAsNumber: true })} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save</Button>
      </div>
    </form>
  );
}
