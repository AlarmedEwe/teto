import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { RegisterDTO, LoginDTO } from '@teto/types';

const authService = new AuthService();

export class AuthController {
  async register(request: FastifyRequest<{ Body: RegisterDTO }>, reply: FastifyReply) {
    try {
      const result = await authService.register(request.body);

      // Gerar Token JWT com payload
      const token = await reply.jwtSign({
        userId: result.user.id,
        email: result.user.email,
        activeWorkspaceId: result.user.activeWorkspaceId,
      });

      // Configurar Cookie HttpOnly seguro
      reply.setCookie('teto_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 dias
      });

      return reply.status(201).send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Erro ao criar conta' });
    }
  }

  async login(request: FastifyRequest<{ Body: LoginDTO }>, reply: FastifyReply) {
    try {
      const result = await authService.login(request.body);

      // Gerar Token JWT com payload
      const token = await reply.jwtSign({
        userId: result.user.id,
        email: result.user.email,
        activeWorkspaceId: result.user.activeWorkspaceId,
      });

      reply.setCookie('teto_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });

      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(401).send({ error: err.message || 'Credenciais inválidas' });
    }
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('teto_token', { path: '/' });
    return reply.status(200).send({ message: 'Logout realizado com sucesso' });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userPayload = (request as any).user;
      if (!userPayload?.userId) {
        return reply.status(401).send({ error: 'Não autenticado' });
      }

      const result = await authService.getMe(userPayload.userId);
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(401).send({ error: err.message || 'Sessão expirada' });
    }
  }
}
