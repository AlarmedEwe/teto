# GEMINI.md - Teto | Gestão Orçamentária Doméstica

Documento mestre de arquitetura, padrões e contexto do projeto **Teto** para auxílio contínuo via IA e desenvolvimento orientado a boas práticas.

---

## 1. Visão Geral e Conceito do Projeto

### 1.1 Origem do Nome & Conceito Central
O projeto chama-se **Teto**, fazendo alusão direta e conceitual à metáfora do **"teto de gastos"** (referência à regra fiscal governamental, adaptada para as finanças pessoais e a economia doméstica).

O objetivo dessa referência não é engessar ou burocratizar, mas estabelecer um **arcabouço financeiro doméstico**:
- **Limites Rígidos e Previsíveis:** Cada categoria de gasto possui um teto financeiro calculado a partir da renda, funcionando como uma baliza para não comprometer a saúde financeira do lar.
- **Disciplina Orçamentária:** Evitar o endividamento passivo forçando o reconhecimento tempestivo de desvios orçamentários.
- **Remanejamento Consciente:** Se um teto for flexibilizado ou excedido em uma categoria, isso requer ajuste explícito e consciente em outra, preservando a poupança/investimentos.

### 1.2 Visão Geral da Solução
Aplicação web **mobile-first** de orçamento doméstico inspirada na metodologia de divisão percentual de renda (estilo AUVP) e tetos orçamentários categorizados. O sistema permite o controle mensal de receitas e despesas, cálculo automático de tetos orçamentários por categoria, acompanhamento visual por gráficos e importação inteligente de faturas de cartão de crédito via CSV com suporte a parcelamentos futuros.

### 1.3 Stack Tecnológica & Tipagem Unificada
Aproveitando o ecossistema full-stack em **TypeScript**, o projeto adota arquitetura de monorepo/workspaces para unificar completamente a camada de tipos entre Frontend e Backend, garantindo *single source of truth* e contrato rigoroso de API.

- **Linguagem:** TypeScript em todo o projeto.
- **Tipos Compartilhados (`packages/types`):** Pacote interno compartilhado contendo todas as interfaces de domínio, DTOs de entrada/saída, enums e tipagens de endpoints consumidos tanto pelo backend quanto pelo frontend.
- **Frontend:** React 18+, TypeScript, Vite, Tailwind CSS, Lucide React (ícones), Recharts (gráfico donut/pizza).
- **Backend:** Node.js, TypeScript, Fastify ou Express, Prisma ORM (ou Drizzle).
- **Banco de Dados:** PostgreSQL 16+.
- **Infraestrutura:** Docker e Docker Compose (orquestrando frontend, backend e banco).

---

## 2. Regras de Negócio e Categorização

### 2.1 Categorias Padrão e Distribuição Percentual da Renda
A soma das metas orçamentárias baseia-se na renda mensal cadastrada ($R$). Por padrão:
1. **Custos Fixos:** $30\%$ (ex: aluguel, condomínio, contas básicas, internet, saúde).
2. **Conforto:** $10\%$ (ex: assinaturas de streaming, melhorias domésticas, academia).
3. **Metas:** $20\%$ (ex: reserva de emergência, projetos de médio prazo, aquisições).
4. **Prazeres:** $10\%$ (ex: restaurantes, lazer, saídas, viagens pontuais).
5. **Investimento (Liberdade Financeira):** $25\%$ (ex: aportes em ações, FIIs, renda fixa de longo prazo).
6. **Conhecimento:** $5\%$ (ex: cursos, livros, certificações, treinamentos).

*Nota: As porcentagens e categorias podem ser customizadas pelo usuário no módulo "Minhas Metas".*

### 2.2 Cálculos de Orçamento
- **Teto da Categoria:** $\text{Teto} = \text{Renda do Mês} \times (\text{Percentual Meta} / 100)$
- **Utilizado (%):** $(\text{Gasto Realizado} / \text{Teto}) \times 100$
- **Total Real (%):** $(\text{Gasto Realizado} / \text{Total de Gastos do Mês}) \times 100$

### 2.3 Importação de Cartão de Crédito e Parcelamentos
- O usuário faz upload de um arquivo `.csv` de extrato/fatura (ex: Nubank, Itaú, Inter).
- **Detecção de Parcelas:**
  - O parser analisa regex no descritivo para identificar padrões como `(02/05)`, `02/05`, `Parcela 2 de 5` ou `(2/5)`.
  - Se identificado que se trata da parcela $X$ de $N$:
    - A parcela $X$ é computada no mês da fatura atual.
    - O sistema cria agendamentos automáticos para os próximos $N - X$ meses correspondentes a cada parcela futura no mesmo valor e categoria.
- **Categorização Automática & Edição:**
  - O sistema atribui uma categoria inicial com base em palavras-chave prévias ou marca como `Pendente de Categorização`.
  - A interface disponibiliza uma tela ou drawer de conciliação rápida pós-upload para o usuário alterar a categoria dos lançamentos em lote ou individualmente.

---

## 3. Modelo de Dados Relacional (PostgreSQL)

```
+--------------------+       +--------------------+
|       users        |       |     categories     |
+--------------------+       +--------------------+
| id (UUID, PK)      |       | id (UUID, PK)      |
| name (VARCHAR)     |       | user_id (UUID, FK) |
| email (VARCHAR)    |       | name (VARCHAR)     |
| created_at         |       | default_pct (DEC)  |
+---------+----------+       | color_hex (VARCHAR)|
          |                  +---------+----------+
          |                            |
          +--------------+-------------+
                         |
+------------------------v------------------------+
|                  monthly_budgets                |
+-------------------------------------------------+
| id (UUID, PK)                                   |
| user_id (UUID, FK)                              |
| month (INT, 1-12)                               |
| year (INT)                                      |
| total_income (DECIMAL(12,2))                    |
+------------------------+------------------------+
                         |
+------------------------v------------------------+
|                  transactions                   |
+-------------------------------------------------+
| id (UUID, PK)                                   |
| user_id (UUID, FK)                              |
| category_id (UUID, FK)                          |
| monthly_budget_id (UUID, FK)                    |
| description (VARCHAR)                           |
| amount (DECIMAL(12,2))                          |
| date (DATE)                                     |
| type (ENUM: 'EXPENSE', 'INCOME')                |
| source (ENUM: 'MANUAL', 'CREDIT_CARD_CSV')      |
| installment_group_id (UUID, NULL)               |
| current_installment (INT, NULL)                 |
| total_installments (INT, NULL)                  |
| created_at (TIMESTAMP)                          |
+-------------------------------------------------+
```

---

## 4. Estrutura do Monorepo e Pacote de Tipos Compartilhados

Para garantir que o backend e o frontend permaneçam sempre em sincronia contratual, o projeto adota uma estrutura em monorepo com suporte a workspaces (ex: npm, pnpm ou yarn workspaces):

```
teto/
├── packages/
│   └── types/                # @teto/types - Single source of truth para tipagens
│       ├── src/
│       │   ├── models.ts     # Entidades (User, Category, MonthlyBudget, Transaction)
│       │   ├── dtos.ts       # Contratos de Request e Response das rotas
│       │   ├── enums.ts      # Enums compartilhados (TransactionType, TransactionSource)
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── budget/
│   │   │   ├── categories/
│   │   │   ├── transactions/
│   │   │   └── imports/
│   │   ├── shared/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   ├── layout/
│   │   │   ├── transactions/
│   │   │   ├── budget/
│   │   │   └── csv-uploader/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/            # Apenas tipos estritamente locais de UI (props, estados locais)
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── package.json              # Configuração raiz de workspaces
```

### 4.1 Diretrizes do Pacote de Tipos (`@teto/types`)
- **Sem duplicação:** Backend e Frontend nunca devem redeclarar tipos de entidades ou DTOs que trafegam via API.
- **Exportação Limpa:** O pacote exporta interfaces puras do TypeScript e enums, podendo ser consumido diretamente via imports locais (ex: `import { Transaction, CreateTransactionDTO } from '@teto/types'`).
- **Validação:** Pode integrar schemas (ex: Zod) para inferência automática de types e reaproveitamento tanto na validação de payloads no backend quanto em formulários no frontend.

---

## 5. Arquitetura do Frontend (Mobile-First)

### 5.1 Design & UI Patterns
- **Tema:** Dark mode com paleta escura (`bg-neutral-950`, cards `bg-neutral-900`, bordas `border-neutral-800`) com acentos em âmbar/dourado (`amber-500`) e indicadores semânticos (verde para dentro do teto, vermelho/laranja para estouro).
- **Responsividade:**
  - **Mobile (< 768px):** Menu inferior fixo (Bottom Navigation Bar), cards verticais empilhados, resumo colapsável e botão de ação rápida flutuante (`+` para novo gasto ou upload de CSV).
  - **Desktop (>= 1024px):** Sidebar retrátil à esquerda e grid de 3 colunas similar ao layout AUVP (Donut Chart | Resumo Orçamentário | Metas e Percentuais).

---

## 6. Estrutura do Backend & Endpoints

### 6.1 Principais Endpoints
Todos os endpoints utilizam os contratos tipados definidos no `@teto/types`:
- `GET /api/budgets/:year/:month` - Retorna renda, total gasto, dados consolidados por categoria e status percentual (`BudgetSummaryResponseDTO`).
- `PUT /api/budgets/:year/:month/income` - Atualiza a renda mensal base (`UpdateIncomeDTO`).
- `GET /api/categories` & `PUT /api/categories` - Consulta e ajusta metas percentuais (`CategoryListResponseDTO`, `UpdateCategoriesDTO`).
- `POST /api/transactions` - Lançamento manual (gasto ou receita) (`CreateTransactionDTO`).
- `POST /api/transactions/import-csv` - Multipart form com arquivo `.csv`, mapeador de colunas e criação em lote com parcelas projetadas (`ImportCsvResponseDTO`).
- `PATCH /api/transactions/:id/category` - Alteração rápida de categoria de lançamento importado (`UpdateTransactionCategoryDTO`).

---

## 7. Docker & Execução Local

### `docker-compose.yml` (Padrão esperado)
- **`db`:** `postgres:16-alpine` com volume persistente e variáveis de ambiente configuradas.
- **`backend`:** Node.js exposto na porta `3333`, com script de migração e hot-reload via `tsx`.
- **`frontend`:** Vite app exposto na porta `5173` com live-reload configurado via volume.

---

## 8. Instruções para Desenvolvimento com IA

1. **Mobile-First Obrigatório:** Todo componente visual deve ser desenhado para telas compactas (`viewport 375px`) antes de expandir para grids de desktop.
2. **Tipagem Unificada & Single Source of Truth:** Frontend e Backend compartilham TypeScript. É **terminantemente proibido** duplicar interfaces de domínio, DTOs de rota ou enums no frontend ou backend. Todas as definições de dados compartilhadas pertencem ao pacote `@teto/types`.
3. **Precisão de Moeda:** Evitar problemas de ponto flutuante em JavaScript salvando valores em centavos no banco (`integer`) ou usando biblioteca decimal no backend, formatando sempre em padrão `pt-BR` (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`).
4. **Resiliência no Parser de CSV:** Suportar variações de delimitadores (`,` ou `;`) e separadores decimais (`.` ou `,`).