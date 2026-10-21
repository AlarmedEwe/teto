import { FastifyReply, FastifyRequest } from 'fastify';
import { TransactionsService } from './transactions.service.js';
import { getDefaultUser } from '../../shared/utils/get-default-user.js';
import { CreateTransactionDTO, UpdateTransactionCategoryDTO, UpdateTransactionDTO } from '@teto/types';

interface TransactionParams {
  id: string;
}

interface TransactionCategoryParams {
  id: string;
}

interface ListTransactionsQuery {
  year?: string;
  month?: string;
}

export class TransactionsController {
  constructor(private transactionsService = new TransactionsService()) {}

  async create(request: FastifyRequest<{ Body: CreateTransactionDTO }>, reply: FastifyReply) {
    const user = await getDefaultUser();
    try {
      const result = await this.transactionsService.createTransaction(user.id, request.body);
      return reply.status(201).send(result);
    } catch (err: any) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message || 'Erro ao criar transação',
      });
    }
  }

  async importCsv(request: FastifyRequest, reply: FastifyReply) {
    const user = await getDefaultUser();
    let csvContent = '';

    try {
      // Verificar se é multipart/form-data
      if (request.isMultipart()) {
        const file = await request.file();
        if (!file) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Nenhum arquivo enviado no formulário',
          });
        }
        const buffer = await file.toBuffer();
        csvContent = buffer.toString('utf-8');
      } else if (typeof request.body === 'string') {
        csvContent = request.body;
      } else if (request.body && typeof (request.body as any).csv === 'string') {
        csvContent = (request.body as any).csv;
      } else {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Formato de requisição inválido. Envie um arquivo CSV multipart/form-data',
        });
      }

      const result = await this.transactionsService.importCsv(user.id, csvContent);
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message || 'Erro ao processar arquivo CSV',
      });
    }
  }

  async updateCategory(
    request: FastifyRequest<{ Params: TransactionCategoryParams; Body: UpdateTransactionCategoryDTO }>,
    reply: FastifyReply
  ) {
    const user = await getDefaultUser();
    try {
      const result = await this.transactionsService.updateCategory(
        user.id,
        request.params.id,
        request.body
      );
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message || 'Erro ao atualizar categoria da transação',
      });
    }
  }

  async update(
    request: FastifyRequest<{ Params: TransactionParams; Body: UpdateTransactionDTO }>,
    reply: FastifyReply
  ) {
    const user = await getDefaultUser();
    try {
      const result = await this.transactionsService.updateTransaction(
        user.id,
        request.params.id,
        request.body
      );
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message || 'Erro ao atualizar transação',
      });
    }
  }

  async delete(
    request: FastifyRequest<{ Params: TransactionParams }>,
    reply: FastifyReply
  ) {
    const user = await getDefaultUser();
    try {
      await this.transactionsService.deleteTransaction(user.id, request.params.id);
      return reply.status(204).send();
    } catch (err: any) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message || 'Erro ao excluir transação',
      });
    }
  }

  async list(
    request: FastifyRequest<{ Querystring: ListTransactionsQuery }>,
    reply: FastifyReply
  ) {
    const user = await getDefaultUser();
    const year = request.query.year ? parseInt(request.query.year, 10) : undefined;
    const month = request.query.month ? parseInt(request.query.month, 10) : undefined;

    const list = await this.transactionsService.listTransactions(user.id, { year, month });
    return reply.status(200).send(list);
  }
}
