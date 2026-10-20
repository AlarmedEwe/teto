import { FastifyReply, FastifyRequest } from 'fastify';
import { CategoriesService } from './categories.service.js';
import { getDefaultUser } from '../../shared/utils/get-default-user.js';
import { UpdateCategoriesDTO } from '@teto/types';

export class CategoriesController {
  constructor(private categoriesService = new CategoriesService()) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = await getDefaultUser();
    const result = await this.categoriesService.listCategories(user.id);
    return reply.status(200).send(result);
  }

  async update(request: FastifyRequest<{ Body: UpdateCategoriesDTO }>, reply: FastifyReply) {
    const user = await getDefaultUser();
    try {
      const result = await this.categoriesService.updateCategories(user.id, request.body);
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
