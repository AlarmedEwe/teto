# DONE.md - Histórico de Tarefas Concluídas | Teto

Este documento registra os marcos e tarefas atômicas concluídas no projeto para auditoria, histórico e geração de changelog.

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
