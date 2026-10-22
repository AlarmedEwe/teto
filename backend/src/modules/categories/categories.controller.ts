import { FastifyReply, FastifyRequest } from 'fastify';
import { CategoriesService } from './categories.service.js';
import { getUserAndWorkspace } from '../../shared/utils/get-user-workspace.js';
import { UpdateCategoriesDTO } from '@teto/types';

export class CategoriesController {
  constructor(private categoriesService = new CategoriesService()) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { userId, workspaceId } = await getUserAndWorkspace(request);
    const result = await this.categoriesService.listCategories(userId, workspaceId);
    return reply.status(200).send(result);
  }

  async update(request: FastifyRequest<{ Body: UpdateCategoriesDTO }>, reply: FastifyReply) {
    const { userId, workspaceId } = await getUserAndWorkspace(request);
    try {
      const result = await this.categoriesService.updateCategories(userId, request.body, workspaceId);
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message || 'Erro ao atualizar categorias',
      });
    }
  }
}
