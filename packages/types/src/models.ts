import { TransactionSource, TransactionType } from './enums.js';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  defaultPct: number; // Ex: 30 para 30%
  colorHex: string;
  icon?: string | null;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  month: number; // 1-12
  year: number;  // Ex: 2026
  totalIncome: number; // Salvo em centavos (inteiro, ex: R$ 5.000,00 -> 500000)
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string | null;
  monthlyBudgetId: string;
  description: string;
  amount: number; // Salvo em centavos (inteiro)
  date: string; // Formato YYYY-MM-DD
  type: TransactionType;
  source: TransactionSource;
  installmentGroupId?: string | null;
  currentInstallment?: number | null;
  totalInstallments?: number | null;
  createdAt: Date;
}
