#!/usr/bin/env bash
set -e

echo "⏳ Aguardando banco de dados PostgreSQL..."
until nc -z -v -w30 db 5432 2>/dev/null; do
  echo "PostgreSQL indisponível - aguardando 2 segundos..."
  sleep 2
done
echo "✅ Conexão com PostgreSQL estabelecida!"

echo "🔄 Aplicando migrações do Prisma..."
npx prisma migrate deploy --schema=backend/prisma/schema.prisma

echo "🌱 Executando seed do banco de dados..."
npx tsx backend/prisma/seed.ts || true

echo "🚀 Iniciando servidor Fastify..."
exec npx tsx watch backend/src/server.ts
