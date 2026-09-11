import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function createUser(email: string, name: string, password: string) {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, name, password: hashed } });
}
