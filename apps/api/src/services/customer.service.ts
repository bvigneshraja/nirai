import { prisma } from '../lib/prisma';
import type { CustomerInput } from '@nirai/schemas';

export const customerService = {
  list: (page = 1, limit = 20, search?: string, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') => {
    const where = search
      ? { OR: [{ name: { contains: search } }, { location: { contains: search } }] }
      : {};
    const orderBy = { [sortBy]: sortOrder } as Record<string, string>;
    return Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy }),
      prisma.customer.count({ where }),
    ]);
  },

  findById: (id: string) =>
    prisma.customer.findUniqueOrThrow({
      where: { id },
      include: { balance: true, ledger: { orderBy: { createdAt: 'desc' }, take: 20 } },
    }),

  create: (data: CustomerInput) =>
    prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({ data });
      await tx.customerBalance.create({ data: { customerId: customer.id, balance: 0 } });
      return customer;
    }),

  update: (id: string, data: Partial<CustomerInput>) =>
    prisma.customer.update({ where: { id }, data }),

  remove: (id: string) =>
    prisma.$transaction(async (tx) => {
      // Delete ledger entries
      await tx.balanceLedger.deleteMany({ where: { customerId: id } });
      // Delete customer balance
      await tx.customerBalance.deleteMany({ where: { customerId: id } });
      // Delete sale items then sales
      const sales = await tx.sale.findMany({ where: { customerId: id }, select: { id: true } });
      if (sales.length > 0) {
        await tx.saleItem.deleteMany({ where: { saleId: { in: sales.map((s) => s.id) } } });
        await tx.sale.deleteMany({ where: { customerId: id } });
      }
      return tx.customer.delete({ where: { id } });
    }),
};
