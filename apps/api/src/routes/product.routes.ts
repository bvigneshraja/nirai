import { authenticate } from '../hooks/authenticate';
import { FastifyInstance } from 'fastify';
import { ProductSchema, ProductUpdateSchema } from '@nirai/schemas';
import { productService } from '../services/product.service';

export async function productRoutes(app: FastifyInstance) {
  const auth = { preHandler: [authenticate] };

  app.get('/products', auth, async (req) => {
    const { page = '1', limit = '20', search, sortBy, sortOrder } = req.query as Record<string, string>;
    const [data, total] = await productService.list(+page, +limit, search, sortBy, (sortOrder as 'asc' | 'desc') || 'desc');
    return { data, total, page: +page, limit: +limit };
  });

  app.get('/products/:id', auth, async (req) => {
    const { id } = req.params as { id: string };
    return productService.findById(id);
  });

  app.post('/products', auth, async (req, reply) => {
    const data = ProductSchema.parse(req.body);
    const product = await productService.create(data);
    return reply.status(201).send(product);
  });

  app.patch('/products/:id', auth, async (req) => {
    const { id } = req.params as { id: string };
    const data = ProductUpdateSchema.parse(req.body);
    return productService.update(id, data);
  });

  app.delete('/products/:id', auth, async (req, reply) => {
    const { id } = req.params as { id: string };
    await productService.remove(id);
    return reply.status(204).send();
  });
}
