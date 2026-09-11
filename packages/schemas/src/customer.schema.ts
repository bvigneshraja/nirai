import { z } from 'zod';

export const CustomerSchema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  creditLimit: z.number().int().min(0).optional(),
});

export const CustomerUpdateSchema = CustomerSchema.partial();

export type CustomerInput = z.infer<typeof CustomerSchema>;
export type CustomerUpdateInput = z.infer<typeof CustomerUpdateSchema>;
