import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomerSchema, CustomerInput } from '@nirai/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Customer } from '@/types';

interface Props {
  defaultValues?: Partial<Customer>;
  onSubmit: (data: CustomerInput) => Promise<void>;
  onCancel: () => void;
}

export function CustomerForm({ defaultValues, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerInput>({
    resolver: zodResolver(CustomerSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Customer Name *" error={errors.name?.message} {...register('name')} />
      <Input label="Contact Person" error={errors.contactPerson?.message} {...register('contactPerson')} />
      <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <Input label="Location" error={errors.location?.message} {...register('location')} />
      <Input
        label="Credit Limit (units)"
        type="number"
        step="1"
        placeholder="e.g. 500"
        error={errors.creditLimit?.message}
        {...register('creditLimit', { valueAsNumber: true, setValueAs: v => v === '' || isNaN(v) ? undefined : Number(v) })}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Save</Button>
      </div>
    </form>
  );
}
