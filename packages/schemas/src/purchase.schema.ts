import { z } from 'zod';

const PurchaseItemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  quantity: z.number().int().positive(),
  unitCost: z.number().positive(),
});

export const PurchaseSchema = z.object({
  supplierId: z.preprocess(
    (v) => (!v || v === '') ? undefined : v,
    z.string().optional()
  ),
  notes: z.string().optional(),
  purchasedAt: z.string().datetime().optional(),
  items: z.array(PurchaseItemSchema).min(1),
});

export type PurchaseInput = z.infer<typeof PurchaseSchema>;
