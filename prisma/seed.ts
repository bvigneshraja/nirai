import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@nirai.com' },
    update: {},
    create: { email: 'admin@nirai.com', name: 'Admin', password, role: 'ADMIN' },
  });
  console.log('Seeded admin user:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
