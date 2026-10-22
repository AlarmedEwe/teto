import { TransactionSource, TransactionType } from './enums.js';
import { Category, Transaction } from './models.js';

// --- DTOs de Orçamento e Tetos ---

export interface CategorySummaryItemDTO {
  categoryId: string;
  name: string;
  targetPct: number;       // Percentual da meta (ex: 30)
  ceilingAmount: number;   // Teto calculado em centavos (Renda * targetPct / 100)
  spentAmount: number;     // Total gasto realizado em centavos
  usedPct: number;         // (spentAmount / ceilingAmount) * 100
  totalRealPct: number;    // (spentAmount / totalSpent do mês) * 100
  colorHex: string;
  icon?: string | null;
}

export interface BudgetSummaryResponseDTO {
  month: number;
  year: number;
  workspaceType?: import('./enums.js').WorkspaceType;
  workspaceName?: string;
  totalIncome: number;     // Renda do mês em centavos
  totalSpent: number;      // Total de despesas do mês em centavos
  balance: number;         // totalIncome - totalSpent em centavos
  cumulativeBalance?: number; // Saldo cumulativo histórico do espaço
  categories: CategorySummaryItemDTO[];
}

export interface UpdateIncomeDTO {
  totalIncome: number;     // Renda em centavos
}

// --- DTOs de Categorias ---

export interface UpdateCategoryItemDTO {
  id: string;
  defaultPct: number;
  colorHex?: string;
  icon?: string | null;
}

export interface UpdateCategoriesDTO {
  categories: UpdateCategoryItemDTO[];
}

export interface CategoryListResponseDTO {
  categories: Category[];
}

// --- DTOs de Transações ---

export interface CreateTransactionDTO {
  categoryId?: string | null;
  description: string;
  amount: number;          // Em centavos (inteiro)
  date: string;            // YYYY-MM-DD
  type: TransactionType;
  source?: TransactionSource;
}

export interface TransactionResponseDTO extends Transaction {}

export interface UpdateTransactionCategoryDTO {
  categoryId: string | null;
}

export interface UpdateTransactionDTO {
  categoryId?: string | null;
  description?: string;
  amount?: number;          // Em centavos (inteiro)
  date?: string;            // YYYY-MM-DD
  type?: TransactionType;
}

// --- DTOs de Importação de Cartão de Crédito (CSV) ---

export interface InstallmentInfoDTO {
  current: number;
  total: number;
}

export interface ImportCsvItemDTO {
  id?: string;
  description: string;
  amount: number;          // Em centavos (inteiro)
  date: string;            // YYYY-MM-DD
  suggestedCategoryId?: string | null;
  installmentInfo?: InstallmentInfoDTO | null;
}

export interface ImportCsvResponseDTO {
  totalProcessed: number;
  transactionsCreated: number;
  pendingCategorization: number;
  items: ImportCsvItemDTO[];
}

// --- DTOs de Autenticação (Argon2id RFC 9106) ---

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  activeWorkspaceId?: string;
}

export interface AuthResponseDTO {
  user: AuthUserDTO;
  message?: string;
}

// --- DTOs de Espaços (Workspaces) e Convites ---

export interface CreateWorkspaceDTO {
  name: string;
  type: import('./enums.js').WorkspaceType;
}

export interface WorkspaceResponseDTO {
  id: string;
  name: string;
  type: import('./enums.js').WorkspaceType;
  ownerId: string;
  role: import('./enums.js').WorkspaceMemberRole;
  createdAt: Date;
}

export interface WorkspaceListResponseDTO {
  workspaces: WorkspaceResponseDTO[];
  activeWorkspaceId: string;
}

export interface InviteMemberDTO {
  email: string;
}

export interface WorkspaceInviteResponseDTO {
  id: string;
  workspaceId: string;
  workspaceName?: string;
  email: string;
  token: string;
  status: import('./enums.js').WorkspaceInviteStatus;
  expiresAt: Date;
  inviteUrl?: string;
}

export interface AcceptInviteDTO {
  token: string;
  name?: string;
  password?: string;
}
