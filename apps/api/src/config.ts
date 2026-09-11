export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
  jwtExpiry: '15m',
  refreshExpiry: '7d',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
