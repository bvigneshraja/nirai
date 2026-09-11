import { authenticate } from '../hooks/authenticate';
import { requireRole } from '../hooks/authorize';
import { FastifyInstance } from 'fastify';
import { CustomerSchema, CustomerUpdateSchema } from '@nirai/schemas';
import { customerService } from '../services/customer.service';

export async function customerRoutes(app: FastifyInstance) {
  const auth = { preHandler: [authenticate] };
  const superAdminOnly = { preHandler: [authenticate, requireRole('SUPER_ADMIN')] };

  app.get('/customers', auth, async (req) => {
    const { page = '1', limit = '20', search, sortBy, sortOrder } = req.query as Record<string, string>;
    const [data, total] = await customerService.list(+page, +limit, search, sortBy, (sortOrder as 'asc' | 'desc') || 'desc');
    const user = req.user as { role?: string };
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const masked = data.map((c: any) => ({
      ...c,
      phone: isSuperAdmin ? c.phone : c.phone ? c.phone.slice(-4).padStart(c.phone.length, '*') : null,
    }));
    return { data: masked, total, page: +page, limit: +limit };
  });

  app.get('/customers/:id', auth, async (req) => {
    const { id } = req.params as { id: string };
    return customerService.findById(id);
  });

  app.post('/customers', auth, async (req, reply) => {
    const data = CustomerSchema.parse(req.body);
    const customer = await customerService.create(data);
    return reply.status(201).send(customer);
  });

  app.patch('/customers/:id', superAdminOnly, async (req) => {
    const { id } = req.params as { id: string };
    const data = CustomerUpdateSchema.parse(req.body);
    return customerService.update(id, data);
  });

  app.delete('/customers/:id', superAdminOnly, async (req, reply) => {
    const { id } = req.params as { id: string };
    await customerService.remove(id);
    return reply.status(204).send();
  });
}
