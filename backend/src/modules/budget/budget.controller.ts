import { FastifyReply, FastifyRequest } from 'fastify';
import { BudgetService } from './budget.service.js';
import { getUserAndWorkspace } from '../../shared/utils/get-user-workspace.js';
import { UpdateIncomeDTO } from '@teto/types';

interface BudgetParams {
  year: string;
  month: string;
}

export class BudgetController {
  constructor(private budgetService = new BudgetService()) {}

  async getSummary(request: FastifyRequest<{ Params: BudgetParams }>, reply: FastifyReply) {
    const { userId, workspaceId } = await getUserAndWorkspace(request);
    const year = parseInt(request.params.year, 10);
    const month = parseInt(request.params.month, 10);

    try {
      const summary = await this.budgetService.getBudgetSummary(userId, year, month, workspaceId);
      return reply.status(200).send(summary);
    } catch (err: any) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message || 'Erro ao carregar orçamento',
      });
    }
  }

  async updateIncome(
    request: FastifyRequest<{ Params: BudgetParams; Body: UpdateIncomeDTO }>,
    reply: FastifyReply
  ) {
    const { userId } = await getUserAndWorkspace(request);
    const year = parseInt(request.params.year, 10);
    const month = parseInt(request.params.month, 10);

    try {
      const summary = await this.budgetService.updateIncome(userId, year, month, request.body);
      return reply.status(200).send(summary);
    } catch (err: any) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message || 'Erro ao atualizar renda do orçamento',
      });
    }
  }
}
