import {
  AuthResponseDTO,
  BudgetSummaryResponseDTO,
  CategoryListResponseDTO,
  CreateTransactionDTO,
  CreateWorkspaceDTO,
  ImportCsvResponseDTO,
  InviteMemberDTO,
  LoginDTO,
  RegisterDTO,
  TransactionResponseDTO,
  UpdateCategoriesDTO,
  UpdateIncomeDTO,
  UpdateTransactionCategoryDTO,
  UpdateTransactionDTO,
  WorkspaceInviteResponseDTO,
  WorkspaceListResponseDTO,
  WorkspaceResponseDTO,
  AcceptInviteDTO,
} from '@teto/types';

const BASE_URL = '/api';

let activeWorkspaceId: string | null = typeof window !== 'undefined'
  ? localStorage.getItem('teto_active_workspace_id')
  : null;

export function setActiveWorkspaceId(id: string | null) {
  activeWorkspaceId = id;
  if (typeof window !== 'undefined') {
    if (id) {
      localStorage.setItem('teto_active_workspace_id', id);
    } else {
      localStorage.removeItem('teto_active_workspace_id');
    }
  }
}

export function getActiveWorkspaceId(): string | null {
  return activeWorkspaceId;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (activeWorkspaceId) {
    headers['x-workspace-id'] = activeWorkspaceId;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include', // Transmite cookies HttpOnly automaticamente
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Erro na requisição: ${res.statusText}`);
  }

  // Tratamento para 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Autenticação (Argon2id RFC 9106)
  auth: {
    async register(data: RegisterDTO): Promise<AuthResponseDTO> {
      const res = await request<AuthResponseDTO>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.user?.activeWorkspaceId) {
        setActiveWorkspaceId(res.user.activeWorkspaceId);
      }
      return res;
    },

    async login(data: LoginDTO): Promise<AuthResponseDTO> {
      const res = await request<AuthResponseDTO>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.user?.activeWorkspaceId) {
        setActiveWorkspaceId(res.user.activeWorkspaceId);
      }
      return res;
    },

    async logout(): Promise<void> {
      await request('/auth/logout', { method: 'POST' });
      setActiveWorkspaceId(null);
    },

    async me(): Promise<AuthResponseDTO> {
      return request<AuthResponseDTO>('/auth/me');
    },
  },

  // Espaços / Contas Multi-tenant
  workspaces: {
    async list(): Promise<WorkspaceListResponseDTO> {
      return request<WorkspaceListResponseDTO>('/workspaces');
    },

    async create(data: CreateWorkspaceDTO): Promise<WorkspaceResponseDTO> {
      return request<WorkspaceResponseDTO>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async invite(workspaceId: string, data: InviteMemberDTO): Promise<WorkspaceInviteResponseDTO> {
      return request<WorkspaceInviteResponseDTO>(`/workspaces/${workspaceId}/invites`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getInvite(token: string): Promise<WorkspaceInviteResponseDTO> {
      return request<WorkspaceInviteResponseDTO>(`/workspaces/invites/${token}`);
    },

    async acceptInvite(data: AcceptInviteDTO): Promise<{ workspaceId: string; workspaceName: string }> {
      const res = await request<{ workspaceId: string; workspaceName: string }>('/workspaces/invites/accept', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.workspaceId) {
        setActiveWorkspaceId(res.workspaceId);
      }
      return res;
    },
  },

  // Orçamentos
  async getBudgetSummary(year: number, month: number): Promise<BudgetSummaryResponseDTO> {
    return request<BudgetSummaryResponseDTO>(`/budgets/${year}/${month}`);
  },

  async updateIncome(year: number, month: number, totalIncome: number): Promise<BudgetSummaryResponseDTO> {
    return request<BudgetSummaryResponseDTO>(`/budgets/${year}/${month}/income`, {
      method: 'PUT',
      body: JSON.stringify({ totalIncome } as UpdateIncomeDTO),
    });
  },

  // Categorias
  async listCategories(): Promise<CategoryListResponseDTO> {
    return request<CategoryListResponseDTO>('/categories');
  },

  async updateCategories(data: UpdateCategoriesDTO): Promise<CategoryListResponseDTO> {
    return request<CategoryListResponseDTO>('/categories', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Transações
  async listTransactions(year?: number, month?: number): Promise<TransactionResponseDTO[]> {
    const query = new URLSearchParams();
    if (year) query.set('year', String(year));
    if (month) query.set('month', String(month));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<TransactionResponseDTO[]>(`/transactions${qs}`);
  },

  async createTransaction(data: CreateTransactionDTO): Promise<TransactionResponseDTO> {
    return request<TransactionResponseDTO>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTransaction(id: string, data: UpdateTransactionDTO): Promise<TransactionResponseDTO> {
    return request<TransactionResponseDTO>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTransaction(id: string): Promise<void> {
    return request<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  async updateTransactionCategory(id: string, categoryId: string | null): Promise<TransactionResponseDTO> {
    return request<TransactionResponseDTO>(`/transactions/${id}/category`, {
      method: 'PATCH',
      body: JSON.stringify({ categoryId } as UpdateTransactionCategoryDTO),
    });
  },

  // Importação CSV
  async importCsv(file: File): Promise<ImportCsvResponseDTO> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (activeWorkspaceId) {
      headers['x-workspace-id'] = activeWorkspaceId;
    }

    const res = await fetch(`${BASE_URL}/transactions/import-csv`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Erro ao importar arquivo CSV');
    }

    return res.json();
  },
};
