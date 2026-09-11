import { FastifyRequest, FastifyReply } from 'fastify';

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { role?: string } | undefined;
    if (!user || !roles.includes(user.role ?? '')) {
      reply.status(403).send({ error: 'Forbidden' });
    }
  };
}
