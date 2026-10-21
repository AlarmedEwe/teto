# Spec 05: Frontend Mobile-First (Design System, Telas e Componentes)

Especificação técnica para o desenvolvimento da interface web do **Teto**, com foco em design mobile-first, tema dark com acentos em âmbar, gráficos AUVP e controle interativo de orçamento.

---

## 1. Princípios de Design & Identidade Visual

### 1.1 Paleta de Cores & Tokens
- **Fundo Principal:** `neutral-950` (`#0a0a0a`)
- **Cards e Superfícies:** `neutral-900` (`#171717`) com bordas `border-neutral-800` (`#262626`)
- **Acento Principal (Branding Teto):** Âmbar/Dourado (`amber-500` / `#f59e0b`, hover `amber-400`)
- **Feedback Semântico de Tetos:**
  - Dentro do Teto ($\le 80\%$ do teto): Esmeralda/Verde (`emerald-500`)
  - Alerta de Proximidade ($81\% - 99\%$): Âmbar (`amber-500`)
  - Teto Estourado ($\ge 100\%$): Vermelho/Rosa (`rose-500` com badge de estouro)

### 1.2 Responsividade & Layouts
- **Mobile (< 768px - Viewport 375px+):**
  - Header compacto com seletor de mês/ano e badge de status do saldo.
  - Donut Chart centralizado e colapsável.
  - Lista vertical de cards de tetos categorizados com barras de progresso animadas.
  - Floating Action Button (FAB) com menu rápido para:
    - ➕ Nova Despesa Manual
    - 💵 Atualizar Renda
    - 💳 Upload de Extrato CSV
  - Bottom Navigation Bar fixo: Dashboard, Transações, Metas (Categorias).
- **Desktop (>= 1024px):**
  - Sidebar retrátil à esquerda.
  - Grid de 3 colunas (Donut Chart | Cards de Tetos e Progresso | Extrato Recente e Ações).

---

## 2. Componentes a Serem Construídos

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Top bar com mês, ano e totalizadores
│   │   ├── BottomNav.tsx           # Navegação mobile fixa inferior
│   │   └── Sidebar.tsx             # Navegação desktop lateral
│   ├── charts/
│   │   └── DonutBudgetChart.tsx    # Gráfico Donut AUVP com Recharts
│   ├── budget/
│   │   ├── IncomeModal.tsx         # Modal para definir/alterar renda líquida
│   │   ├── CategoryCard.tsx        # Card individual com barra de teto e status
│   │   └── CategoryGoalsModal.tsx  # Modal para ajuste das porcentagens AUVP
│   ├── transactions/
│   │   ├── TransactionModal.tsx    # Modal de lançamento manual
│   │   └── TransactionList.tsx     # Lista de transações do mês com badge de parcelas
│   └── csv-uploader/
│       └── CsvUploadModal.tsx      # Modal drag-and-drop para extratos e conciliação
├── services/
│   └── api.ts                      # Client HTTP tipado com DTOs de @teto/types
├── hooks/
│   └── useBudget.ts                # Hook de estado do orçamento e transações
├── styles/
│   └── index.css                   # Tailwind + Google Fonts Inter + variáveis CSS
└── App.tsx
```

---

## 3. Critérios de Aceite
1. [ ] Tailwind CSS configurado com paleta Dark Mode e fontes limpas (Inter).
2. [ ] Gráfico Donut de alocação orçamentária responsivo e interativo com Recharts.
3. [ ] Cards de categorias exibindo: teto em R$, valor gasto, barra de progresso colorida semântica e percentual utilizado.
4. [ ] Modais funcionais integrados aos endpoints do backend:
   - Alteração de renda mensal (`PUT /api/budgets/:year/:month/income`).
   - Lançamento de despesa manual (`POST /api/transactions`).
   - Upload de arquivo CSV com conciliação (`POST /api/transactions/import-csv`).
   - Ajuste de metas percentuais das categorias (`PUT /api/categories`).
5. [ ] BottomNav no mobile e Sidebar no desktop funcionando perfeitamente sem quebra de layout em 375px.
6. [ ] Formatação de moeda estritamente em `pt-BR` a partir dos centavos inteiros retornados pela API.
