import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', authController.register.bind(authController));
  app.post('/login', authController.login.bind(authController));
  app.post('/logout', authController.logout.bind(authController));
  app.get('/me', { preHandler: [(app as any).authenticate] }, authController.me.bind(authController));
}
