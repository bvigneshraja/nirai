import { prisma } from '../lib/prisma';
import type { PurchaseInput } from '@nirai/schemas';

export const purchaseService = {
  list: (page = 1, limit = 20, sortBy = 'purchasedAt', sortOrder: 'asc' | 'desc' = 'desc', search?: string) => {
    const orderBy = { [sortBy]: sortOrder } as Record<string, string>;
    const where = search
      ? {
          OR: [
            { notes: { contains: search } },
            { supplier: { name: { contains: search } } },
          ],
        }
      : undefined;
    return Promise.all([
      prisma.purchase.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        where,
        include: { supplier: true, items: { include: { product: true } } },
      }),
      prisma.purchase.count({ where }),
    ]);
  },

  create: (data: PurchaseInput) =>
    prisma.$transaction(async (tx) => {
      const total = data.items.reduce((s, i) => s + i.quantity * i.unitCost, 0);

      const purchase = await tx.purchase.create({
        data: {
          supplierId: data.supplierId,
          totalAmount: total,
          notes: data.notes,
          purchasedAt: data.purchasedAt ? new Date(data.purchasedAt) : new Date(),
          items: {
            create: data.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitCost: i.unitCost,
              subtotal: i.quantity * i.unitCost,
            })),
          },
        },
        include: { items: true },
      });

      // Increment stock for each item
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return purchase;
    }),
};
