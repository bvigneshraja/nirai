import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
dotenvConfig({ path: resolve(__dirname, '../.env') });

import { buildApp } from './app';
import { config } from './config';

async function main() {
  const app = await buildApp();
  await app.listen({ port: config.port, host: '0.0.0.0' });
  console.log(`Nirai API running on port ${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
