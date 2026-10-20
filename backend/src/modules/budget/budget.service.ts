import { prisma } from '../../shared/database/prisma.js';
import {
  calculateCeiling,
  calculateUsedPct,
  calculateTotalRealPct,
  calculateBalance,
} from './budget.calculator.js';
import {
  BudgetSummaryResponseDTO,
  CategorySummaryItemDTO,
  UpdateIncomeDTO,
} from '@teto/types';

export class BudgetService {
  async getBudgetSummary(userId: string, year: number, month: number): Promise<BudgetSummaryResponseDTO> {
    if (month < 1 || month > 12) {
      throw new Error('Mês deve estar entre 1 e 12');
    }
    if (year < 2000 || year > 2100) {
      throw new Error('Ano inválido');
    }

    // Obter ou criar registro de MonthlyBudget
    const budget = await prisma.monthlyBudget.upsert({
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

    // Obter categorias do usuário
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { defaultPct: 'desc' },
    });

    // Obter transações de despesa do orçamento
    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        monthlyBudgetId: budget.id,
        type: 'EXPENSE',
      },
    });

    // Somar despesas totais e por categoria
    let totalSpent = 0;
    const spentByCategory = new Map<string, number>();

    for (const tx of expenseTransactions) {
      totalSpent += tx.amount;
      if (tx.categoryId) {
        const current = spentByCategory.get(tx.categoryId) || 0;
        spentByCategory.set(tx.categoryId, current + tx.amount);
      }
    }

    // Consolidar dados de cada categoria
    const categorySummaries: CategorySummaryItemDTO[] = categories.map((cat) => {
      const ceilingAmount = calculateCeiling(budget.totalIncome, cat.defaultPct);
      const spentAmount = spentByCategory.get(cat.id) || 0;
      const usedPct = calculateUsedPct(spentAmount, ceilingAmount);
      const totalRealPct = calculateTotalRealPct(spentAmount, totalSpent);

      return {
        categoryId: cat.id,
        name: cat.name,
        targetPct: cat.defaultPct,
        ceilingAmount,
        spentAmount,
        usedPct,
        totalRealPct,
        colorHex: cat.colorHex,
      };
    });

    const balance = calculateBalance(budget.totalIncome, totalSpent);

    return {
      month: budget.month,
      year: budget.year,
      totalIncome: budget.totalIncome,
      totalSpent,
      balance,
      categories: categorySummaries,
    };
  }

  async updateIncome(
    userId: string,
    year: number,
    month: number,
    data: UpdateIncomeDTO
  ): Promise<BudgetSummaryResponseDTO> {
    if (typeof data.totalIncome !== 'number' || data.totalIncome < 0) {
      throw new Error('Renda mensal informada deve ser um número maior ou igual a zero (em centavos)');
    }

    await prisma.monthlyBudget.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      update: {
        totalIncome: Math.round(data.totalIncome),
      },
      create: {
        userId,
        month,
        year,
        totalIncome: Math.round(data.totalIncome),
      },
    });

    return this.getBudgetSummary(userId, year, month);
  }
}
