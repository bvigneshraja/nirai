#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "Starting Nirai API..."
exec npx ts-node \
  --transpile-only \
  --project apps/api/tsconfig.json \
  apps/api/src/index.ts
