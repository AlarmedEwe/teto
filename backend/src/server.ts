import 'dotenv/config';
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import multipart from '@fastify/multipart';
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
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

await app.register(cookie, {
  secret: process.env.COOKIE_SECRET || 'teto-super-secret-cookie-salt-at-least-32-chars-long!',
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'teto-argon2id-rfc9106-super-secret-jwt-key-32-bytes!',
  cookie: {
    cookieName: 'teto_token',
    signed: false,
  },
});

// Decorar hook de autenticação
app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.cookies.teto_token;
    if (token) {
      await request.jwtVerify({ onlyCookie: true });
    } else {
      await request.jwtVerify();
    }
  } catch (err) {
    return reply.status(401).send({ error: 'Não autorizado. Faça login para continuar.' });
  }
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

import { authRoutes } from './modules/auth/auth.routes.js';
import { workspacesRoutes } from './modules/workspaces/workspaces.routes.js';
import { categoriesRoutes } from './modules/categories/categories.routes.js';
import { budgetRoutes } from './modules/budget/budget.routes.js';
import { transactionsRoutes } from './modules/transactions/transactions.routes.js';

// Registrar rotas da API
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(workspacesRoutes, { prefix: '/api/workspaces' });
await app.register(categoriesRoutes, { prefix: '/api/categories' });
await app.register(budgetRoutes, { prefix: '/api/budgets' });
await app.register(transactionsRoutes, { prefix: '/api/transactions' });

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
