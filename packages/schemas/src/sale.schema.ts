import { z } from 'zod';

const SaleItemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export const SaleSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  paidAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
  soldAt: z.preprocess(
    (v) => {
      if (!v || v === '') return undefined;
      const d = new Date(v as string);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    },
    z.string().datetime().optional()
  ),
  items: z.array(SaleItemSchema).min(1),
});

export type SaleInput = z.infer<typeof SaleSchema>;
