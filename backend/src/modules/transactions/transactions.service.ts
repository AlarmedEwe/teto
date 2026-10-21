import { randomUUID } from 'node:crypto';
import { prisma } from '../../shared/database/prisma.js';
import { parseTransactionsCsv } from './csv-parser.js';
import {
  CreateTransactionDTO,
  ImportCsvItemDTO,
  ImportCsvResponseDTO,
  TransactionResponseDTO,
  TransactionSource,
  TransactionType,
  UpdateTransactionCategoryDTO,
  UpdateTransactionDTO,
} from '@teto/types';

export class TransactionsService {
  /**
   * Obtém ou cria o MonthlyBudget correspondente para uma data específica.
   */
  private async getOrCreateBudget(userId: string, year: number, month: number) {
    return await prisma.monthlyBudget.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      update: {},
      create: {
        userId,
        month,
        year,
        totalIncome: 0,
      },
    });
  }

  /**
   * Criação manual de transação única (gasto ou receita).
   */
  async createTransaction(userId: string, data: CreateTransactionDTO): Promise<TransactionResponseDTO> {
    const dateObj = new Date(data.date);
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;

    const budget = await this.getOrCreateBudget(userId, year, month);

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        monthlyBudgetId: budget.id,
        categoryId: data.categoryId || null,
        description: data.description,
        amount: Math.round(data.amount),
        date: dateObj,
        type: data.type || TransactionType.EXPENSE,
        source: data.source || TransactionSource.MANUAL,
      },
    });

    return {
      id: transaction.id,
      userId: transaction.userId,
      categoryId: transaction.categoryId,
      monthlyBudgetId: transaction.monthlyBudgetId,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date.toISOString().split('T')[0],
      type: transaction.type as TransactionType,
      source: transaction.source as TransactionSource,
      installmentGroupId: transaction.installmentGroupId,
      currentInstallment: transaction.currentInstallment,
      totalInstallments: transaction.totalInstallments,
      createdAt: transaction.createdAt,
    };
  }

  /**
   * Importação inteligente de arquivo CSV com detecção e projeção automática de parcelas.
   */
  async importCsv(userId: string, csvContent: string): Promise<ImportCsvResponseDTO> {
    const parsedRows = parseTransactionsCsv(csvContent);
    if (parsedRows.length === 0) {
      return {
        totalProcessed: 0,
        transactionsCreated: 0,
        pendingCategorization: 0,
        items: [],
      };
    }

    // Carregar categorias existentes do usuário para mapeamento inteligente
    const categories = await prisma.category.findMany({
      where: { userId },
    });

    let totalCreated = 0;
    let pendingCategorization = 0;
    const responseItems: ImportCsvItemDTO[] = [];

    for (const row of parsedRows) {
      const baseDate = new Date(row.date);
      const baseYear = baseDate.getUTCFullYear();
      const baseMonth = baseDate.getUTCMonth() + 1;
      const baseDay = baseDate.getUTCDate();

      // Mapear categoria se encontrada no CSV ou por correspondência de nome
      let matchedCategoryId: string | null = null;
      if (row.categoryName) {
        const found = categories.find((c) =>
          c.name.toLowerCase().includes(row.categoryName!.toLowerCase())
        );
        if (found) matchedCategoryId = found.id;
      }

      if (!matchedCategoryId) {
        pendingCategorization++;
      }

      const budget = await this.getOrCreateBudget(userId, baseYear, baseMonth);

      if (row.installmentInfo) {
        const { current, total } = row.installmentInfo;
        const installmentGroupId = randomUUID();

        // 1. Criar a parcela atual (mês da fatura)
        const currentTx = await prisma.transaction.create({
          data: {
            userId,
            monthlyBudgetId: budget.id,
            categoryId: matchedCategoryId,
            description: row.description,
            amount: row.amount,
            date: baseDate,
            type: TransactionType.EXPENSE,
            source: TransactionSource.CREDIT_CARD_CSV,
            installmentGroupId,
            currentInstallment: current,
            totalInstallments: total,
          },
        });
        totalCreated++;

        responseItems.push({
          id: currentTx.id,
          description: row.description,
          amount: row.amount,
          date: row.date,
          suggestedCategoryId: matchedCategoryId,
          installmentInfo: { current, total },
        });

        // 2. Projetar automaticamente as N - X parcelas futuras nos meses seguintes
        const remainingInstallments = total - current;
        for (let k = 1; k <= remainingInstallments; k++) {
          const futureMonthIndex = (baseMonth - 1) + k;
          const futureYear = baseYear + Math.floor(futureMonthIndex / 12);
          const futureMonth = (futureMonthIndex % 12) + 1;

          // Calcular dia seguro para o mês alvo (ex: dia 31 em fevereiro ajusta para 28)
          const daysInFutureMonth = new Date(Date.UTC(futureYear, futureMonth, 0)).getUTCDate();
          const targetDay = Math.min(baseDay, daysInFutureMonth);
          const futureDate = new Date(Date.UTC(futureYear, futureMonth - 1, targetDay));

          const futureBudget = await this.getOrCreateBudget(userId, futureYear, futureMonth);

          await prisma.transaction.create({
            data: {
              userId,
              monthlyBudgetId: futureBudget.id,
              categoryId: matchedCategoryId,
              description: row.description,
              amount: row.amount,
              date: futureDate,
              type: TransactionType.EXPENSE,
              source: TransactionSource.CREDIT_CARD_CSV,
              installmentGroupId,
              currentInstallment: current + k,
              totalInstallments: total,
            },
          });
          totalCreated++;
        }
      } else {
        // Transação à vista / sem parcelamento
        const tx = await prisma.transaction.create({
          data: {
            userId,
            monthlyBudgetId: budget.id,
            categoryId: matchedCategoryId,
            description: row.description,
            amount: row.amount,
            date: baseDate,
            type: TransactionType.EXPENSE,
            source: TransactionSource.CREDIT_CARD_CSV,
          },
        });
        totalCreated++;

        responseItems.push({
          id: tx.id,
          description: row.description,
          amount: row.amount,
          date: row.date,
          suggestedCategoryId: matchedCategoryId,
        });
      }
    }

    return {
      totalProcessed: parsedRows.length,
      transactionsCreated: totalCreated,
      pendingCategorization,
      items: responseItems,
    };
  }

  /**
   * Alteração rápida de categoria de uma transação.
   * Se a transação pertencer a um grupo de parcelas, atualiza em lote todas as parcelas do grupo.
   */
  async updateCategory(
    userId: string,
    transactionId: string,
    data: UpdateTransactionCategoryDTO
  ): Promise<TransactionResponseDTO> {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new Error('Transação não encontrada');
    }

    // Se fizer parte de um grupo de parcelamento, atualiza todas as parcelas correlacionadas
    if (existing.installmentGroupId) {
      await prisma.transaction.updateMany({
        where: {
          installmentGroupId: existing.installmentGroupId,
          userId,
        },
        data: {
          categoryId: data.categoryId || null,
        },
      });
    } else {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { categoryId: data.categoryId || null },
      });
    }

    const updated = await prisma.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      categoryId: updated.categoryId,
      monthlyBudgetId: updated.monthlyBudgetId,
      description: updated.description,
      amount: updated.amount,
      date: updated.date.toISOString().split('T')[0],
      type: updated.type as TransactionType,
      source: updated.source as TransactionSource,
      installmentGroupId: updated.installmentGroupId,
      currentInstallment: updated.currentInstallment,
      totalInstallments: updated.totalInstallments,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Atualização completa de transação existente (descrição, valor, data, categoria, tipo).
   */
  async updateTransaction(
    userId: string,
    transactionId: string,
    data: UpdateTransactionDTO
  ): Promise<TransactionResponseDTO> {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new Error('Transação não encontrada');
    }

    let monthlyBudgetId = existing.monthlyBudgetId;

    // Se a data foi alterada, verificar se pertence a outro mês/ano e associar ao monthlyBudget correto
    let dateObj = existing.date;
    if (data.date) {
      dateObj = new Date(data.date);
      const year = dateObj.getUTCFullYear();
      const month = dateObj.getUTCMonth() + 1;
      const budget = await this.getOrCreateBudget(userId, year, month);
      monthlyBudgetId = budget.id;
    }

    const type = data.type || (existing.type as TransactionType);
    const categoryId = type === TransactionType.INCOME
      ? null
      : (data.categoryId !== undefined ? data.categoryId : existing.categoryId);

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        description: data.description !== undefined ? data.description.trim() : existing.description,
        amount: data.amount !== undefined ? Math.round(data.amount) : existing.amount,
        date: dateObj,
        categoryId,
        type,
        monthlyBudgetId,
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      categoryId: updated.categoryId,
      monthlyBudgetId: updated.monthlyBudgetId,
      description: updated.description,
      amount: updated.amount,
      date: updated.date.toISOString().split('T')[0],
      type: updated.type as TransactionType,
      source: updated.source as TransactionSource,
      installmentGroupId: updated.installmentGroupId,
      currentInstallment: updated.currentInstallment,
      totalInstallments: updated.totalInstallments,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Exclusão de uma transação.
   */
  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new Error('Transação não encontrada');
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });
  }

  /**
   * Listagem de transações com filtros opcionais de ano e mês.
   */
  async listTransactions(
    userId: string,
    options?: { year?: number; month?: number }
  ): Promise<TransactionResponseDTO[]> {
    let whereClause: any = { userId };

    if (options?.year && options?.month) {
      const budget = await prisma.monthlyBudget.findUnique({
        where: {
          userId_month_year: {
            userId,
            month: options.month,
            year: options.year,
          },
        },
      });

      if (budget) {
        whereClause.monthlyBudgetId = budget.id;
      } else {
        return [];
      }
    }

    const list = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return list.map((t) => ({
      id: t.id,
      userId: t.userId,
      categoryId: t.categoryId,
      monthlyBudgetId: t.monthlyBudgetId,
      description: t.description,
      amount: t.amount,
      date: t.date.toISOString().split('T')[0],
      type: t.type as TransactionType,
      source: t.source as TransactionSource,
      installmentGroupId: t.installmentGroupId,
      currentInstallment: t.currentInstallment,
      totalInstallments: t.totalInstallments,
      createdAt: t.createdAt,
    }));
  }
}
