#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "Starting Nirai API..."
exec npx ts-node \
  --transpile-only \
  --compiler-options '{"module":"CommonJS","esModuleInterop":true}' \
  apps/api/src/index.ts
