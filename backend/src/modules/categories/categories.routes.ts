import { FastifyInstance } from 'fastify';
import { CategoriesController } from './categories.controller.js';

export async function categoriesRoutes(app: FastifyInstance) {
  const controller = new CategoriesController();

  app.get('/', controller.list.bind(controller));
  app.put('/', controller.update.bind(controller));
}
