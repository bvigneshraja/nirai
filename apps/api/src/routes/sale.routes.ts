import { authenticate } from '../hooks/authenticate';
import { FastifyInstance } from 'fastify';
import { SaleSchema } from '@nirai/schemas';
import { saleService } from '../services/sale.service';

export async function saleRoutes(app: FastifyInstance) {
  const auth = { preHandler: [authenticate] };

  app.get('/sales', auth, async (req) => {
    const { page = '1', limit = '20', search, sortBy, sortOrder } = req.query as Record<string, string>;
    const [data, total] = await saleService.list(+page, +limit, search, sortBy, (sortOrder as 'asc' | 'desc') || 'desc');
    return { data, total, page: +page, limit: +limit };
  });

  app.post('/sales', auth, async (req, reply) => {
    const data = SaleSchema.parse(req.body);
    const sale = await saleService.create(data);
    return reply.status(201).send(sale);
  });
}
