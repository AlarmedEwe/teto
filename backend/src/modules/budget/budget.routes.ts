import { FastifyInstance } from 'fastify';
import { BudgetController } from './budget.controller.js';

export async function budgetRoutes(app: FastifyInstance) {
  const controller = new BudgetController();

  app.get('/:year/:month', controller.getSummary.bind(controller));
  app.put('/:year/:month/income', controller.updateIncome.bind(controller));
}
