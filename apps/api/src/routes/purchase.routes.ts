import { authenticate } from '../hooks/authenticate';
import { FastifyInstance } from 'fastify';
import { PurchaseSchema } from '@nirai/schemas';
import { purchaseService } from '../services/purchase.service';

export async function purchaseRoutes(app: FastifyInstance) {
  const auth = { preHandler: [authenticate] };

  app.get('/purchases', auth, async (req) => {
    const { page = '1', limit = '20', sortBy, sortOrder, search } = req.query as Record<string, string>;
    const [data, total] = await purchaseService.list(+page, +limit, sortBy, (sortOrder as 'asc' | 'desc') || 'desc', search);
    return { data, total, page: +page, limit: +limit };
  });

  app.post('/purchases', auth, async (req, reply) => {
    const data = PurchaseSchema.parse(req.body);
    const purchase = await purchaseService.create(data);
    return reply.status(201).send(purchase);
  });
}
