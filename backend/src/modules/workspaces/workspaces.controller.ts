import { FastifyRequest, FastifyReply } from 'fastify';
import { WorkspacesService } from './workspaces.service.js';
import { AuthService } from '../auth/auth.service.js';
import { CreateWorkspaceDTO, InviteMemberDTO, AcceptInviteDTO } from '@teto/types';

const workspacesService = new WorkspacesService();
const authService = new AuthService();

export class WorkspacesController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const activeWorkspaceId = (request.query as any)?.activeWorkspaceId || user.activeWorkspaceId;
      const result = await workspacesService.listUserWorkspaces(user.userId, activeWorkspaceId);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Erro ao listar espaços' });
    }
  }

  async create(request: FastifyRequest<{ Body: CreateWorkspaceDTO }>, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const result = await workspacesService.createWorkspace(user.userId, request.body);
      return reply.status(201).send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Erro ao criar espaço' });
    }
  }

  async invite(request: FastifyRequest<{ Params: { id: string }; Body: InviteMemberDTO }>, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const workspaceId = request.params.id;
      const result = await workspacesService.inviteMember(user.userId, workspaceId, request.body.email);
      return reply.status(201).send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Erro ao gerar convite' });
    }
  }

  async getInviteInfo(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      const result = await workspacesService.getInviteInfo(request.params.token);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message || 'Convite não encontrado' });
    }
  }

  async acceptInvite(request: FastifyRequest<{ Body: AcceptInviteDTO }>, reply: FastifyReply) {
    try {
      let userId = (request as any).user?.userId;

      // Se o usuário ainda não estiver logado, mas forneceu nome e senha para criar conta
      if (!userId) {
        if (!request.body.name || !request.body.password) {
          return reply.status(401).send({ error: 'Faça login ou informe nome e senha para criar sua conta.' });
        }

        const inviteInfo = await workspacesService.getInviteInfo(request.body.token);
        const registered = await authService.register({
          name: request.body.name,
          email: inviteInfo.email,
          password: request.body.password,
        });

        userId = registered.user.id;
      }

      const result = await workspacesService.acceptInvite(userId, request.body.token);

      // Atualiza token JWT com novo activeWorkspaceId
      const token = await reply.jwtSign({
        userId,
        email: (request as any).user?.email,
        activeWorkspaceId: result.workspaceId,
      });

      reply.setCookie('teto_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });

      return reply.send({ message: 'Convite aceito com sucesso!', ...result });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Erro ao aceitar convite' });
    }
  }
}
