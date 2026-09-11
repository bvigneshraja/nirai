import Fastify, { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { corsPlugin } from './plugins/cors.plugin';
import { authRoutes } from './routes/auth.routes';
import { customerRoutes } from './routes/customer.routes';
import { productRoutes } from './routes/product.routes';
import { purchaseRoutes } from './routes/purchase.routes';
import { saleRoutes } from './routes/sale.routes';
import { balanceRoutes } from './routes/balance.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { config } from './config';

async function v1Routes(api: FastifyInstance) {
  await api.register(customerRoutes);
  await api.register(productRoutes);
  await api.register(purchaseRoutes);
  await api.register(saleRoutes);
  await api.register(balanceRoutes);
  await api.register(dashboardRoutes);
}

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Register JWT at root level so app.jwt is available everywhere
  await app.register(jwt, { secret: config.jwtSecret });

  await app.register(corsPlugin);
  await app.register(authRoutes);
  await app.register(v1Routes, { prefix: '/api/v1' });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
