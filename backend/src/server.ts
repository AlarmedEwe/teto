import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { prisma } from './shared/database/prisma.js';

const app = Fastify({
  logger: process.env.NODE_ENV === 'development' ? {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  } : true,
});

// Registrar plugins fundamentais
await app.register(sensible);
await app.register(cors, {
  origin: true, // Em desenvolvimento, permite origens locais
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

// Rota de Healthcheck com verificação de banco de dados
app.get('/health', async (_request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
    };
  } catch (err) {
    app.log.error(err, 'Falha de conexão com o banco de dados');
    return reply.status(503).send({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Não foi possível comunicar com o PostgreSQL',
    });
  }
});

import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { budgetRoutes } from './modules/budget/budget.routes.js';

// Registrar rotas da API
await app.register(categoriesRoutes, { prefix: '/api/categories' });
await app.register(budgetRoutes, { prefix: '/api/budgets' });

// Inicialização do servidor
const PORT = Number(process.env.PORT) || 3333;
const HOST = '0.0.0.0';

try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`🚀 Servidor Teto rodando em http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Encerrando servidor e conexões...');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
