# Spec 01: Setup do Monorepo e Pacote de Tipos (@teto/types)

Especificação técnica e contratual para o setup da estrutura de workspaces do monorepo e a criação do pacote de tipos compartilhados.

---

## 1. Objetivo & Contexto
Estabelecer a fundação do monorepo com gerenciamento unificado de dependências (workspaces) e configurar o pacote `@teto/types` como a **Single Source of Truth** de modelos e DTOs, garantindo que o backend e o frontend compartilhem o mesmo contrato tipado.

---

## 2. Estrutura de Arquivos a Ser Criada

```
teto/
├── package.json                   # Workspaces raiz: ["packages/*", "backend", "frontend"]
├── tsconfig.base.json             # Configuração TypeScript base compartilhada
├── packages/
│   └── types/
│       ├── package.json           # name: "@teto/types"
│       ├── tsconfig.json
│       └── src/
│           ├── enums.ts           # TransactionType, TransactionSource
│           ├── models.ts          # User, Category, MonthlyBudget, Transaction
│           ├── dtos.ts            # DTOs de Requests e Responses de rotas
│           └── index.ts           # Barrel export
├── backend/
│   ├── package.json               # Dependência "@teto/types": "*"
│   └── tsconfig.json
└── frontend/
    ├── package.json               # Dependência "@teto/types": "*"
    └── tsconfig.json
```

---

## 3. Contratos e Modelos Iniciais (`@teto/types`)

### 3.1 Enums (`enums.ts`)
- `TransactionType`: `'EXPENSE' | 'INCOME'`
- `TransactionSource`: `'MANUAL' | 'CREDIT_CARD_CSV'`

### 3.2 Entidades de Domínio (`models.ts`)
- `User`: `{ id: string; name: string; email: string; createdAt: Date; }`
- `Category`: `{ id: string; userId: string; name: string; defaultPct: number; colorHex: string; }`
- `MonthlyBudget`: `{ id: string; userId: string; month: number; year: number; totalIncome: number; }`
- `Transaction`:
  ```typescript
  export interface Transaction {
    id: string;
    userId: string;
    categoryId?: string;
    monthlyBudgetId: string;
    description: string;
    amount: number; // Em centavos (inteiro)
    date: string; // ISO YYYY-MM-DD
    type: TransactionType;
    source: TransactionSource;
    installmentGroupId?: string;
    currentInstallment?: number;
    totalInstallments?: number;
    createdAt: Date;
  }
  ```

### 3.3 Contratos de API / DTOs (`dtos.ts`)
- `CategorySummaryItemDTO`: `{ categoryId: string; name: string; targetPct: number; ceilingAmount: number; spentAmount: number; usedPct: number; totalRealPct: number; colorHex: string; }`
- `BudgetSummaryResponseDTO`:
  - `month`: `number`
  - `year`: `number`
  - `totalIncome`: `number` (em centavos)
  - `totalSpent`: `number` (em centavos)
  - `balance`: `number` (em centavos)
  - `categories`: `CategorySummaryItemDTO[]`
- `UpdateIncomeDTO`: `{ totalIncome: number }`
- `CreateTransactionDTO`:
  - `categoryId?: string`
  - `description: string`
  - `amount: number` (em centavos)
  - `date: string` (YYYY-MM-DD)
  - `type: TransactionType`
- `ImportCsvItemDTO`:
  - `description: string`
  - `amount: number` (em centavos)
  - `date: string`
  - `suggestedCategoryId?: string`
  - `installmentInfo?: { current: number; total: number }`
- `ImportCsvResponseDTO`:
  - `totalProcessed: number`
  - `transactionsCreated: number`
  - `pendingCategorization: number`
  - `items: ImportCsvItemDTO[]`
- `UpdateTransactionCategoryDTO`: `{ categoryId: string }`

---

## 4. Critérios de Aceite (Definition of Done)
1. [ ] `package.json` raiz com workspaces configurados e funcionando.
2. [ ] `@teto/types` estruturado com `enums.ts`, `models.ts`, `dtos.ts` e exportado via `index.ts`.
3. [ ] `backend` configurado com dependência `@teto/types` e resolução de paths sem erros de compilação.
4. [ ] `frontend` configurado com dependência `@teto/types` e resolução de paths sem erros de compilação.
5. [ ] Script `npm run typecheck` ou compilação `tsc --noEmit` executando com sucesso em todos os workspaces.
