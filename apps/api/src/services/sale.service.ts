import { prisma } from '../lib/prisma';
import type { SaleInput } from '@nirai/schemas';

export const saleService = {
  list: (page = 1, limit = 20, search?: string, sortBy = 'soldAt', sortOrder: 'asc' | 'desc' = 'desc') => {
    const where = search ? { customer: { name: { contains: search } } } : {};
    const orderBy = { [sortBy]: sortOrder } as Record<string, string>;
    return Promise.all([
      prisma.sale.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: { customer: true, items: { include: { product: true } } },
      }),
      prisma.sale.count({ where }),
    ]);
  },

  create: (data: SaleInput) =>
    prisma.$transaction(async (tx) => {
      const total = data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      const outstanding = total - data.paidAmount;
      const status = data.paidAmount >= total ? 'PAID' : data.paidAmount > 0 ? 'PARTIAL' : 'PENDING';

      const sale = await tx.sale.create({
        data: {
          customerId: data.customerId,
          totalAmount: total,
          paidAmount: data.paidAmount,
          status,
          notes: data.notes,
          soldAt: data.soldAt ? new Date(data.soldAt) : new Date(),
          items: {
            create: data.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: i.quantity * i.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      // Deduct stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Update customer holding balance (outstanding amount owed)
      if (outstanding > 0) {
        await tx.customerBalance.upsert({
          where: { customerId: data.customerId },
          create: { customerId: data.customerId, balance: outstanding },
          update: { balance: { increment: outstanding } },
        });

        await tx.balanceLedger.create({
          data: {
            customerId: data.customerId,
            type: 'DEBIT',
            amount: outstanding,
            description: `Sale ${sale.id} — outstanding`,
            refId: sale.id,
          },
        });
      }

      return sale;
    }),
};
