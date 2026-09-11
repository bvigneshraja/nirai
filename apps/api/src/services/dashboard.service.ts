import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

const CACHE_KEY = 'dashboard:stats';
const CACHE_TTL = 60;

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getDashboardStats() {
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const [
    totalCustomers,
    totalProducts,
    salesTodayAgg,
    lowStockProducts,
    recentSales,
    allActiveSales,
    allPurchases,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.sale.aggregate({
      where: { soldAt: { gte: today }, status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.product.findMany({ where: { stock: { lte: 20 } }, take: 6, orderBy: { stock: 'asc' } }),
    prisma.sale.findMany({
      take: 5,
      orderBy: { soldAt: 'desc' },
      include: { customer: true },
    }),
    prisma.sale.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: { items: { include: { product: true } }, customer: true },
      orderBy: { soldAt: 'asc' },
    }),
    prisma.purchase.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { purchasedAt: 'asc' },
    }),
  ]);

  // ── Totals ──────────────────────────────────────────────────
  const totalRevenue = allActiveSales.reduce((s, sale) => s + sale.totalAmount, 0);
  const totalOutstanding = allActiveSales.reduce((s, sale) => s + (sale.totalAmount - sale.paidAmount), 0);
  const totalCostOfGoods = allActiveSales.reduce(
    (s, sale) => s + sale.items.reduce((ss, i) => ss + i.quantity * ((i.product as any)?.defaultCost ?? 0), 0), 0
  );
  const totalMargin = totalRevenue - totalCostOfGoods;
  const totalPurchaseSpend = allPurchases.reduce((s, p) => s + p.totalAmount, 0);

  // ── Sales + Purchase by date (last 30 days) ─────────────────
  const salesByDateMap: Record<string, number> = {};
  const purchaseByDateMap: Record<string, number> = {};
  const costByDateMap: Record<string, number> = {};

  for (const sale of allActiveSales) {
    const k = dateKey(new Date(sale.soldAt));
    salesByDateMap[k] = (salesByDateMap[k] ?? 0) + sale.totalAmount;
    const cost = sale.items.reduce((s, i) => s + i.quantity * ((i.product as any)?.defaultCost ?? 0), 0);
    costByDateMap[k] = (costByDateMap[k] ?? 0) + cost;
  }
  for (const p of allPurchases) {
    const k = dateKey(new Date(p.purchasedAt));
    purchaseByDateMap[k] = (purchaseByDateMap[k] ?? 0) + p.totalAmount;
  }

  const allDates = [...new Set([
    ...Object.keys(salesByDateMap),
    ...Object.keys(purchaseByDateMap),
  ])].sort();

  const salesTrend = allDates.map(date => ({
    date,
    sales: Math.round(salesByDateMap[date] ?? 0),
    cost: Math.round(costByDateMap[date] ?? 0),
    margin: Math.round((salesByDateMap[date] ?? 0) - (costByDateMap[date] ?? 0)),
    purchases: Math.round(purchaseByDateMap[date] ?? 0),
  }));

  // ── Product-wise margin ──────────────────────────────────────
  const productMap: Record<string, { name: string; revenue: number; cost: number; qty: number }> = {};
  for (const sale of allActiveSales) {
    for (const item of sale.items) {
      const prod = item.product as any;
      if (!prod) continue;
      if (!productMap[prod.id]) productMap[prod.id] = { name: prod.name, revenue: 0, cost: 0, qty: 0 };
      productMap[prod.id].revenue += item.quantity * item.unitPrice;
      productMap[prod.id].cost += item.quantity * (prod.defaultCost ?? 0);
      productMap[prod.id].qty += item.quantity;
    }
  }
  const productMargins = Object.values(productMap)
    .map(p => ({
      name: p.name,
      revenue: Math.round(p.revenue),
      cost: Math.round(p.cost),
      margin: Math.round(p.revenue - p.cost),
      marginPct: p.cost > 0 ? Math.round(((p.revenue - p.cost) / p.cost) * 100 * 10) / 10 : 0,
      qty: p.qty,
    }))
    .sort((a, b) => b.margin - a.margin);

  // ── Top customers by outstanding ─────────────────────────────
  const custMap: Record<string, { name: string; outstanding: number; revenue: number }> = {};
  for (const sale of allActiveSales) {
    const cid = sale.customerId;
    if (!custMap[cid]) custMap[cid] = { name: (sale as any).customer?.name ?? cid, outstanding: 0, revenue: 0 };
    custMap[cid].outstanding += sale.totalAmount - sale.paidAmount;
    custMap[cid].revenue += sale.totalAmount;
  }
  const topCustomers = Object.values(custMap)
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 6);

  const stats = {
    totalCustomers,
    totalProducts,
    salesToday: { amount: salesTodayAgg._sum.totalAmount ?? 0, count: salesTodayAgg._count },
    totalRevenue,
    totalOutstanding,
    totalCostOfGoods,
    totalMargin,
    totalPurchaseSpend,
    marginPercent: totalCostOfGoods > 0 ? Math.round((totalMargin / totalCostOfGoods) * 1000) / 10 : 0,
    lowStockProducts,
    recentSales,
    salesTrend,
    productMargins,
    topCustomers,
  };

  await redis.set(CACHE_KEY, JSON.stringify(stats), 'EX', CACHE_TTL);
  return stats;
}
