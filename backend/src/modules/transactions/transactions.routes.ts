import { FastifyInstance } from 'fastify';
import { TransactionsController } from './transactions.controller.js';

export async function transactionsRoutes(app: FastifyInstance) {
  const controller = new TransactionsController();

  app.get('/', controller.list.bind(controller));
  app.post('/', controller.create.bind(controller));
  app.post('/import-csv', controller.importCsv.bind(controller));
  app.patch('/:id/category', controller.updateCategory.bind(controller));
}
