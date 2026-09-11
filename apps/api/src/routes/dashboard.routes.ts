import { authenticate } from '../hooks/authenticate';
import { FastifyInstance } from 'fastify';
import { getDashboardStats } from '../services/dashboard.service';

export async function dashboardRoutes(app: FastifyInstance) {
  const auth = { preHandler: [authenticate] };
  app.get('/dashboard', auth, async () => getDashboardStats());
}
