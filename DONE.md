# DONE.md - Histórico de Tarefas Concluídas | Teto

Este documento registra os marcos e tarefas atômicas concluídas no projeto para auditoria, histórico e geração de changelog.

---

### [2026-10-21] - Marco 6: Docker Compose & Infraestrutura Local
- [x] Criação da especificação técnica [specs/06-docker-compose-orquestracao.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/06-docker-compose-orquestracao.md).
- [x] Implementação do `backend/Dockerfile` e `backend/entrypoint.sh` aguardando a prontidão do PostgreSQL, aplicando migrações do Prisma e executando seed das categorias AUVP automaticamente.
- [x] Implementação do `frontend/Dockerfile` com suporte aos workspaces do monorepo e `@teto/types`, expondo o Vite em `0.0.0.0:5173`.
- [x] Atualização do `docker-compose.yml` orquestrando os 3 contêineres (`db`, `backend`, `frontend`) com healthcheck e ordem de inicialização dependente (`service_healthy`).
- [x] Validação sintática e de configuração completa via `docker compose config`.

---

### [2026-10-21] - Marco 5: Frontend Mobile-First (Design System & Telas)
- [x] Criação da especificação técnica [specs/05-frontend-mobile-first.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/05-frontend-mobile-first.md).
- [x] Setup do Tailwind CSS com tema Dark Mode (`neutral-950`/`neutral-900`), acentos em âmbar (`amber-500`), utilitários glassmorphism e fonte Inter via Google Fonts.
- [x] Implementação do cliente HTTP tipado (`services/api.ts`) consumindo diretamente os contratos de `@teto/types`.
- [x] Implementação do hook de gerenciamento de estado orçamentário (`hooks/useBudget.ts`) com navegação de meses e sincronização reativa.
- [x] Implementação dos componentes de layout:
  - `Header`: Seletor de mês/ano, logotipo Teto e cards de renda, gasto total e saldo líquido em tempo real.
  - `BottomNav`: Navegação móvel fixa inferior com Floating Action Button (`+`) de ações rápidas.
  - `Sidebar`: Navegação desktop lateral com atalhos de lançamentos e status do teto.
- [x] Implementação do gráfico Donut AUVP interativo com Recharts (`DonutBudgetChart.tsx`) exibindo a fatia de cada categoria no bolo de gastos do mês.
- [x] Implementação dos cards de categorias (`CategoryCard.tsx`) com barras de progresso semânticas (verde para dentro do teto, âmbar para alerta e vermelho para estouro) e cálculo de valores restantes.
- [x] Implementação dos 4 modais interativos:
  - `IncomeModal`: Atualização da renda mensal líquida base com recálculo automático instantâneo dos tetos.
  - `CategoryGoalsModal`: Edição das porcentagens da divisão AUVP com limitador estrito de 100%.
  - `TransactionModal`: Formulário de lançamento manual de despesas ou receitas extras.
  - `CsvUploadModal`: Drag-and-drop de arquivos `.csv` com conciliação rápida pós-importação.
- [x] Validação completa do build de produção via `npm run build` e typecheck sem erros.

---

### [2026-10-20] - Marco 4: Parser de CSV & Projeção de Parcelamentos
- [x] Criação da especificação técnica [specs/04-parser-csv-e-parcelamento.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/04-parser-csv-e-parcelamento.md).
- [x] Implementação do detector inteligente de parcelamento por regex (`installment-detector.ts`) suportando `(02/05)`, `[2/10]`, `Parcela 3 de 12`, `01/10` e blindagem contra falsos positivos de datas (`15/10/2026`).
- [x] Implementação do parser flexível de extratos CSV (`csv-parser.ts`) tolerante a delimitadores (`,`, `;`), separadores decimais (`.`, `,`) e padrões de data (ISO e BR).
- [x] 100% de cobertura de testes unitários para o detector de parcelamento e parser de CSV (28 testes passando).
- [x] Implementação do `TransactionsService` com projeção automática das $N - X$ parcelas futuras nos meses subsequentes com mesmo `installmentGroupId` e virada de ano correta.
- [x] Implementação dos endpoints Fastify:
  - `POST /api/transactions`: Lançamento manual de despesas ou receitas.
  - `POST /api/transactions/import-csv`: Upload de arquivo multipart/form-data com retorno de estatísticas e lista de transações criadas.
  - `PATCH /api/transactions/:id/category`: Conciliação rápida de categoria com atualização em lote para todas as parcelas do mesmo grupo.
  - `GET /api/transactions`: Consulta de transações com filtros por ano e mês.
- [x] Teste de integração end-to-end simulando upload real de fatura Nubank com compra parcelada em 5x gerando parcelas até janeiro de 2027.

---

### [2026-10-20] - Marco 3: Módulo de Orçamento & Cálculo de Tetos
- [x] Criação da especificação técnica [specs/03-orcamento-e-tetos.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/03-orcamento-e-tetos.md).
- [x] Implementação de funções puras de cálculo matemático de tetos, percentual de uso e percentual real (`budget.calculator.ts`).
- [x] 100% de cobertura em testes unitários com `node:test` (`test/budget.calculator.test.ts`), validando arredondamento, divisão por zero e tetos negativos.
- [x] Implementação do módulo `categories` (`GET /api/categories`, `PUT /api/categories`) com validação que impede metas cuja soma ultrapasse 100%.
- [x] Implementação do módulo `budget` (`GET /api/budgets/:year/:month`, `PUT /api/budgets/:year/:month/income`) consolidando tetos por categoria em tempo real a partir da renda informada em centavos.
- [x] Testes de integração via curl cobrindo cenários de sucesso e validação de erro (HTTP 400).

---

### [2026-10-20] - Marco 2: Backend Skeleton, Banco de Dados & Prisma
- [x] Criação da especificação técnica [specs/02-database-e-backend-core.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/02-database-e-backend-core.md).
- [x] Configuração do `docker-compose.yml` e subida do container PostgreSQL 16 Alpine na porta 5432.
- [x] Modelagem do schema Prisma (`schema.prisma`) com `User`, `Category`, `MonthlyBudget` e `Transaction` respeitando estritamente o modelo de dados e precisão em centavos.
- [x] Execução da migration inicial (`20261020224645_init`).
- [x] Criação e execução do script de seed (`seed.ts`), populando usuário padrão e as 6 categorias padrão da metodologia AUVP (30/10/20/10/25/5).
- [x] Configuração do servidor Fastify com `@fastify/cors`, `@fastify/sensible` e endpoint `/health` com verificação ativa de conectividade com o banco.
- [x] Teste de requisição `GET /health` validado com retorno HTTP 200 OK.

---

### [2026-10-20] - Marco 1: Fundação do Monorepo & `@teto/types`
- [x] Criação do `.nvmrc` com Node 22 (LTS Jod).
- [x] Configuração do `package.json` raiz com npm workspaces (`packages/*`, `backend`, `frontend`).
- [x] Criação do `tsconfig.base.json` com configurações rigorosas de compilação.
- [x] Implementação do pacote compartilhado `@teto/types`:
  - [x] `enums.ts`: `TransactionType`, `TransactionSource`, `StandardCategoryKey`.
  - [x] `models.ts`: `User`, `Category`, `MonthlyBudget`, `Transaction` (com precisão em centavos).
  - [x] `dtos.ts`: DTOs de resumo de orçamento, cálculo de tetos, transações e conciliação de CSV.
  - [x] `index.ts`: barrel export de todos os modelos e DTOs.
- [x] Configuração do `backend` com dependência `@teto/types` e validação com `tsx`.
- [x] Configuração do `frontend` (Vite + React + Tailwind) consumindo `@teto/types` diretamente.
- [x] Verificação bem-sucedida de `npm run typecheck` e `npm run build` em todos os workspaces.

---

### [2026-10-20] - Definições e Setup Inicial
- [x] Criação e refinamento do [GEMINI.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/GEMINI.md) com regras do Teto e tipagem compartilhada.
- [x] Definição de boas práticas de Spec-Driven Development (SDD) e documentação em [HUMAN.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/HUMAN.md).
- [x] Configuração do [.antigravityignore](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/.antigravityignore) para isolar histórico (`DONE.md`), notas (`HUMAN.md`) e diretórios de build.
- [x] Criação do repositório público no GitHub: [AlarmedEwe/teto](https://github.com/AlarmedEwe/teto).
- [x] Criação do [README.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/README.md) completo e [.gitignore](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/.gitignore).
