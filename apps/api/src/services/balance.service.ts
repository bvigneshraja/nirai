import { prisma } from '../lib/prisma';

export const balanceService = {
  list: async (page = 1, limit = 20, sortBy = 'name', sortOrder: 'asc' | 'desc' = 'asc') => {
    // Fetch all customers (balance is computed in memory from sales)
    const allCustomers = await prisma.customer.findMany({
      include: {
        sales: {
          include: { items: { include: { product: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    const total = allCustomers.length;

    const allData = allCustomers.map((c) => {
      const activeSales = c.sales.filter(s => s.status !== 'CANCELLED');
      const stockOnHold = activeSales.reduce((sum, s) => sum + s.items.reduce((ss, i) => ss + i.quantity, 0), 0);
      const amountDue = activeSales.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0);
      const costValue = activeSales.reduce(
        (sum, s) =>
          sum + s.items.reduce((ss, i) => ss + i.quantity * (i.product as any).defaultCost, 0),
        0,
      );
      const expectedProfit = activeSales.reduce((sum, s) => sum + s.totalAmount, 0) - costValue;
      const creditLimit = c.creditLimit ?? 0;
      const capacityBalance = creditLimit - amountDue;
      return {
        customerId: c.id,
        customer: c,
        stockOnHold,
        amountDue,
        costValue,
        expectedProfit,
        creditLimit,
        capacityBalance,
      };
    });

    // Sort in memory (supports computed fields like amountDue, expectedProfit, creditLimit)
    const dir = sortOrder === 'asc' ? 1 : -1;
    allData.sort((a, b) => {
      let av: any, bv: any;
      if (sortBy === 'name') { av = a.customer.name; bv = b.customer.name; }
      else { av = (a as any)[sortBy] ?? 0; bv = (b as any)[sortBy] ?? 0; }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    const data = allData.slice((page - 1) * limit, page * limit);

    return [data, total] as const;
  },

  forCustomer: (customerId: string) =>
    prisma.customerBalance.findUniqueOrThrow({
      where: { customerId },
      include: { customer: true },
    }),

  credit: (customerId: string, amount: number, description?: string) =>
    prisma.$transaction(async (tx) => {
      const updated = await tx.customerBalance.update({
        where: { customerId },
        data: { balance: { decrement: amount } },
      });
      await tx.balanceLedger.create({
        data: { customerId, type: 'CREDIT', amount, description },
      });
      return updated;
    }),

  ledger: (customerId: string, page = 1, limit = 30) =>
    prisma.balanceLedger.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
};
