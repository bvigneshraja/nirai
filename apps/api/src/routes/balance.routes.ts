import { authenticate } from '../hooks/authenticate';
import { FastifyInstance } from 'fastify';
import { CreditSchema } from '@nirai/schemas';
import { balanceService } from '../services/balance.service';

export async function balanceRoutes(app: FastifyInstance) {
  const auth = { preHandler: [authenticate] };

  app.get('/balances', auth, async (req) => {
    const { page = '1', limit = '20', sortBy, sortOrder } = req.query as Record<string, string>;
    const [data, total] = await balanceService.list(+page, +limit, sortBy, (sortOrder as 'asc' | 'desc') || 'asc');
    return { data, total, page: +page, limit: +limit };
  });

  app.get('/balances/:customerId', auth, async (req) => {
    const { customerId } = req.params as { customerId: string };
    return balanceService.forCustomer(customerId);
  });

  app.post('/balances/:customerId/credit', auth, async (req) => {
    const { customerId } = req.params as { customerId: string };
    const { amount, description } = CreditSchema.parse(req.body);
    return balanceService.credit(customerId, amount, description);
  });

  app.get('/balances/:customerId/ledger', auth, async (req) => {
    const { customerId } = req.params as { customerId: string };
    const { page = '1' } = req.query as Record<string, string>;
    return balanceService.ledger(customerId, +page);
  });
}
