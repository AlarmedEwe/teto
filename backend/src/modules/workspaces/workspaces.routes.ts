import { FastifyInstance } from 'fastify';
import { WorkspacesController } from './workspaces.controller.js';

const controller = new WorkspacesController();

export async function workspacesRoutes(app: FastifyInstance) {
  // Rotas autenticadas
  app.get('/', { preHandler: [(app as any).authenticate] }, controller.list.bind(controller));
  app.post('/', { preHandler: [(app as any).authenticate] }, controller.create.bind(controller));
  app.post('/:id/invites', { preHandler: [(app as any).authenticate] }, controller.invite.bind(controller));

  // Rotas de convite (podem ser acessadas com ou sem sessão)
  app.get('/invites/:token', controller.getInviteInfo.bind(controller));
  app.post('/invites/accept', controller.acceptInvite.bind(controller));
}
