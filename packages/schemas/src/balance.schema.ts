import { z } from 'zod';

export const CreditSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
});

export type CreditInput = z.infer<typeof CreditSchema>;
