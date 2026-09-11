import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(1),
  defaultCost: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  unit: z.string().default('pcs'),
});

export const ProductUpdateSchema = ProductSchema.partial();

export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
