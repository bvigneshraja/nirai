import { FastifyInstance } from 'fastify';
import { LoginSchema } from '@nirai/schemas';
import { validateUser } from '../services/auth.service';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    const body = LoginSchema.parse(request.body);
    const user = await validateUser(body.email, body.password);
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' });
    const token = app.jwt.sign(user, { expiresIn: '15m' });
    return { token, user };
  });
}
