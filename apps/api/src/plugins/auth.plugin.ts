import { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { config } from '../config';

export async function authPlugin(app: FastifyInstance) {
  await app.register(jwt, { secret: config.jwtSecret });
}
