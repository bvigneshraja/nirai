import { prisma } from '../lib/prisma';
import type { ProductInput } from '@nirai/schemas';

export const productService = {
  list: (page = 1, limit = 20, search?: string, sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') => {
    const where = search ? { name: { contains: search } } : {};
    const orderBy = { [sortBy]: sortOrder } as Record<string, string>;
    return Promise.all([
      prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy }),
      prisma.product.count({ where }),
    ]);
  },

  findById: (id: string) => prisma.product.findUniqueOrThrow({ where: { id } }),

  create: (data: ProductInput) =>
    prisma.product.create({
      data,
    }),

  update: (id: string, data: Partial<ProductInput>) =>
    prisma.product.update({ where: { id }, data }),

  remove: (id: string) => prisma.product.delete({ where: { id } }),
};
