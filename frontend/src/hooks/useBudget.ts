import { useState, useEffect, useCallback } from 'react';
import {
  BudgetSummaryResponseDTO,
  CreateTransactionDTO,
  ImportCsvResponseDTO,
  TransactionResponseDTO,
  UpdateCategoryItemDTO,
} from '@teto/types';
import { api } from '../services/api.js';

export function useBudget() {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getUTCFullYear());
  const [month, setMonth] = useState<number>(today.getUTCMonth() + 1);

  const [budget, setBudget] = useState<BudgetSummaryResponseDTO | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [budgetData, txsData] = await Promise.all([
        api.getBudgetSummary(year, month),
        api.listTransactions(year, month),
      ]);
      setBudget(budgetData);
      setTransactions(txsData);
    } catch (err: any) {
      console.error('Erro ao carregar dados orçamentários:', err);
      setError(err.message || 'Falha ao sincronizar dados');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const updateIncome = async (totalIncome: number) => {
    const updated = await api.updateIncome(year, month, totalIncome);
    setBudget(updated);
  };

  const updateCategories = async (items: UpdateCategoryItemDTO[]) => {
    await api.updateCategories({ categories: items });
    await loadData();
  };

  const createTransaction = async (data: CreateTransactionDTO) => {
    await api.createTransaction(data);
    await loadData();
  };

  const importCsv = async (file: File): Promise<ImportCsvResponseDTO> => {
    const res = await api.importCsv(file);
    await loadData();
    return res;
  };

  const updateTransactionCategory = async (txId: string, categoryId: string | null) => {
    await api.updateTransactionCategory(txId, categoryId);
    await loadData();
  };

  return {
    year,
    month,
    budget,
    transactions,
    loading,
    error,
    prevMonth,
    nextMonth,
    refresh: loadData,
    updateIncome,
    updateCategories,
    createTransaction,
    importCsv,
    updateTransactionCategory,
  };
}
