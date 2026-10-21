import {
  BudgetSummaryResponseDTO,
  CategoryListResponseDTO,
  CreateTransactionDTO,
  ImportCsvResponseDTO,
  TransactionResponseDTO,
  UpdateCategoriesDTO,
  UpdateIncomeDTO,
  UpdateTransactionCategoryDTO,
} from '@teto/types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro na requisição: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
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

  async updateTransactionCategory(id: string, categoryId: string | null): Promise<TransactionResponseDTO> {
    return request<TransactionResponseDTO>(`/transactions/${id}/category`, {
      method: 'PATCH',
      body: JSON.stringify({ categoryId } as UpdateTransactionCategoryDTO),
    });
  },

  // Upload CSV (Multipart)
  async importCsv(file: File): Promise<ImportCsvResponseDTO> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/transactions/import-csv`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao importar arquivo CSV');
    }

    return res.json();
  },
};
