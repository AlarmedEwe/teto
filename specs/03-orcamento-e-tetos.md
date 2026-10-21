# Spec 03: Módulo de Orçamento & Cálculo de Tetos

Especificação técnica dos endpoints de consulta orçamentária, cálculo de tetos categorizados, atualização de renda mensal e gerenciamento de metas percentuais das categorias.

---

## 1. Objetivo & Regras de Negócio

### 1.1 Fórmulas Matemáticas
Com base nas definições da Seção 2 do [GEMINI.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/GEMINI.md):
- **Teto da Categoria ($T$):**
  $$T = \text{Math.round}\left(\text{Renda do Mês} \times \frac{\text{Percentual Meta}}{100}\right)$$
- **Utilizado (%):**
  $$\text{Utilizado} = T > 0 ? \left(\frac{\text{Gasto Realizado}}{T}\right) \times 100 : 0$$
- **Total Real (%):**
  $$\text{Total Real} = \text{Total Gasto do Mês} > 0 ? \left(\frac{\text{Gasto Realizado}}{\text{Total Gasto do Mês}}\right) \times 100 : 0$$
- **Saldo Disponível:**
  $$\text{Saldo} = \text{Renda do Mês} - \text{Total Gasto do Mês}$$

*Todos os valores monetários são estritamente inteiros em centavos.*

---

## 2. Contratos de API Utilizados (de `@teto/types`)

### 2.1 Categorias
- `GET /api/categories` -> Retorna `CategoryListResponseDTO`:
  ```typescript
  {
    categories: Category[];
  }
  ```
- `PUT /api/categories` -> Recebe `UpdateCategoriesDTO`:
  ```typescript
  {
    categories: Array<{ id: string; defaultPct: number; colorHex?: string }>;
  }
  ```
  *Validação: percentual deve ser um inteiro positivo e a soma das categorias não deve ultrapassar 100%.*

### 2.2 Orçamento e Tetos Mensais
- `GET /api/budgets/:year/:month` -> Retorna `BudgetSummaryResponseDTO`:
  ```typescript
  {
    month: number;
    year: number;
    totalIncome: number; // centavos
    totalSpent: number;  // centavos
    balance: number;     // totalIncome - totalSpent
    categories: Array<{
      categoryId: string;
      name: string;
      targetPct: number;
      ceilingAmount: number; // centavos
      spentAmount: number;   // centavos
      usedPct: number;       // float 1 casa decimal (ex: 83.3)
      totalRealPct: number;  // float 1 casa decimal (ex: 59.5)
      colorHex: string;
    }>;
  }
  ```
- `PUT /api/budgets/:year/:month/income` -> Recebe `UpdateIncomeDTO`:
  ```typescript
  {
    totalIncome: number; // centavos >= 0
  }
  ```
  *Retorna o `BudgetSummaryResponseDTO` recalculado.*

---

## 3. Estrutura Modular no Backend

```
backend/src/
├── modules/
│   ├── categories/
│   │   ├── categories.service.ts
│   │   ├── categories.controller.ts
│   │   └── categories.routes.ts
│   └── budget/
│       ├── budget.calculator.ts       # Funções puras de cálculo (testáveis isoladamente)
│       ├── budget.service.ts
│       ├── budget.controller.ts
│       └── budget.routes.ts
└── test/
    └── budget.calculator.test.ts     # Testes unitários com node:test
```

---

## 4. Critérios de Aceite
1. [ ] Funções puras de cálculo matemático de tetos implementadas com 100% de cobertura de testes unitários (`budget.calculator.test.ts`).
2. [ ] `GET /api/categories` listando as 6 categorias padrão de tetos.
3. [ ] `PUT /api/categories` atualizando percentuais com validação.
4. [ ] `PUT /api/budgets/:year/:month/income` criando ou atualizando a renda mensal base em centavos.
5. [ ] `GET /api/budgets/:year/:month` retornando consolidação precisa de tetos, valores gastos e percentuais de uso.
6. [ ] `npm run typecheck` e testes passando sem erros.
