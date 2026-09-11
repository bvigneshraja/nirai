import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCTS = [
  { key: 'PROD001', name: 'Ponni Raw Rice',  defaultCost: 1190, unit: 'kg' },
  { key: 'PROD002', name: 'Wheat',           defaultCost: 1040, unit: 'kg' },
  { key: 'PROD003', name: 'Toor Dal',        defaultCost: 2090, unit: 'kg' },
  { key: 'PROD004', name: 'Sugar',           defaultCost:  975, unit: 'kg' },
];

const PURCHASES = [
  { date: '2026-09-01', productKey: 'PROD001', qty: 100, unitCost: 1200 },
  { date: '2026-09-01', productKey: 'PROD002', qty:  80, unitCost: 1050 },
  { date: '2026-09-02', productKey: 'PROD003', qty:  60, unitCost: 2100 },
  { date: '2026-09-02', productKey: 'PROD001', qty:  70, unitCost: 1180 },
  { date: '2026-09-03', productKey: 'PROD004', qty:  90, unitCost:  980 },
  { date: '2026-09-03', productKey: 'PROD002', qty:  60, unitCost: 1030 },
  { date: '2026-09-04', productKey: 'PROD003', qty:  50, unitCost: 2080 },
  { date: '2026-09-04', productKey: 'PROD001', qty:  80, unitCost: 1190 },
  { date: '2026-09-05', productKey: 'PROD004', qty:  70, unitCost:  970 },
  { date: '2026-09-05', productKey: 'PROD002', qty:  90, unitCost: 1040 },
];

async function main() {
  // Upsert products by name
  const productMap: Record<string, string> = {};
  for (const p of PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    const product = existing
      ? await prisma.product.update({ where: { id: existing.id }, data: { defaultCost: p.defaultCost, unit: p.unit } })
      : await prisma.product.create({ data: { name: p.name, defaultCost: p.defaultCost, unit: p.unit, stock: 0 } });
    productMap[p.key] = product.id;
    console.log(`Product: ${p.name} → ${product.id}`);
  }

  // Create purchases
  for (const row of PURCHASES) {
    const productId = productMap[row.productKey];
    const total = row.qty * row.unitCost;

    const purchase = await prisma.purchase.create({
      data: {
        purchasedAt: new Date(row.date),
        totalAmount: total,
        items: {
          create: [{
            productId,
            quantity: row.qty,
            unitCost: row.unitCost,
            subtotal: total,
          }],
        },
      },
    });

    // Increment stock
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: row.qty } },
    });

    console.log(`Purchase ${purchase.id}: ${row.productKey} ×${row.qty} @ ₹${row.unitCost} = ₹${total}`);
  }

  console.log('\nDone.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
