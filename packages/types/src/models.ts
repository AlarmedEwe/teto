import { TransactionSource, TransactionType, WorkspaceType, WorkspaceMemberRole, WorkspaceInviteStatus } from './enums.js';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  ownerId: string;
  createdAt: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  joinedAt: Date;
  user?: User;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  token: string;
  status: WorkspaceInviteStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  workspaceId?: string | null;
  name: string;
  defaultPct: number; // Ex: 30 para 30%
  colorHex: string;
  icon?: string | null;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  workspaceId?: string | null;
  month: number; // 1-12
  year: number;  // Ex: 2026
  totalIncome: number; // Salvo em centavos (inteiro, ex: R$ 5.000,00 -> 500000)
}

export interface Transaction {
  id: string;
  userId: string;
  workspaceId?: string | null;
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
