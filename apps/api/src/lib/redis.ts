import Redis from 'ioredis';
import { config } from '../config';

let redisClient: Redis | null = null;

try {
  redisClient = new Redis(config.redisUrl, { lazyConnect: true, enableOfflineQueue: false });
  redisClient.on('error', () => { redisClient = null; });
} catch {
  redisClient = null;
}

export const redis = {
  get: async (key: string): Promise<string | null> => {
    try { return await redisClient?.get(key) ?? null; } catch { return null; }
  },
  set: async (key: string, value: string, mode?: string, ttl?: number): Promise<void> => {
    try {
      if (mode === 'EX' && ttl) await redisClient?.set(key, value, 'EX', ttl);
      else await redisClient?.set(key, value);
    } catch { /* Redis unavailable — skip cache */ }
  },
};
