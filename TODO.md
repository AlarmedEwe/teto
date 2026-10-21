# TODO.md - Backlog & Tarefas Ativas | Teto

Backlog de desenvolvimento organizado por marcos técnicos e guiado pelas especificações em `specs/`. Tarefas concluídas são movidas para `DONE.md`.

---

## 🎯 Marco 1: Fundação do Monorepo & `@teto/types`
*Especificação de referência:* [specs/01-setup-monorepo-e-types.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/01-setup-monorepo-e-types.md)

- [x] **Configuração da Raiz do Monorepo:**
  - [x] Criar `package.json` raiz com workspaces (`packages/*`, `backend`, `frontend`).
  - [x] Criar `tsconfig.base.json` com configurações estritas e paths compartilhados.
- [x] **Implementação do Pacote `@teto/types`:**
  - [x] Criar `packages/types/package.json` e `packages/types/tsconfig.json`.
  - [x] Implementar `enums.ts` (`TransactionType`, `TransactionSource`).
  - [x] Implementar `models.ts` (`User`, `Category`, `MonthlyBudget`, `Transaction`).
  - [x] Implementar `dtos.ts` (contratos de entrada e saída das rotas da API).
  - [x] Implementar `index.ts` (barrel export de tipos e enums).
- [x] **Vinculação com Backend e Frontend:**
  - [x] Configurar `backend/package.json` e `backend/tsconfig.json` para consumir `@teto/types`.
  - [x] Configurar `frontend/package.json` e `frontend/tsconfig.json` para consumir `@teto/types`.
  - [x] Executar build/typecheck comprovando importação sem erro nos dois lados.

---

## 🎯 Marco 2: Backend Skeleton, Banco de Dados & Prisma
*Especificação de referência:* [specs/02-database-e-backend-core.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/02-database-e-backend-core.md)

- [x] Inicializar Fastify no `backend/src/server.ts`.
- [x] Configurar Prisma ORM com schema PostgreSQL refletindo o modelo de dados do [GEMINI.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/GEMINI.md).
- [x] Gerar migration inicial e seed com as categorias padrão AUVP (30/10/20/10/25/5).
- [x] Implementar middleware de tratamento de erros e resposta padronizada.

---

## 🎯 Marco 3: Módulo de Orçamento & Cálculo de Tetos
*Especificação de referência:* [specs/03-orcamento-e-tetos.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/03-orcamento-e-tetos.md)
- [x] Implementar módulo `budget` (service + controller + rotas).
- [x] Implementar cálculos de teto por categoria a partir da renda informada.
- [x] Implementar cálculo de percentual utilizado e percentual do gasto total.
- [x] Criar testes unitários para as fórmulas matemáticas do teto.

---

## 🎯 Marco 4: Parser de CSV & Projeção de Parcelamentos
*Especificação de referência:* [specs/04-parser-csv-e-parcelamento.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/04-parser-csv-e-parcelamento.md)
- [x] Implementar módulo de upload multipart/form-data.
- [x] Implementar parser tolerante a delimitadores (`,`, `;`) e separadores decimais.
- [x] Implementar regex de detecção de parcelamento (`02/05`, `Parcela 2 de 5`).
- [x] Implementar gerador de transações futuras com `installment_group_id`.
- [x] Testes unitários com fixtures de faturas reais (Nubank, Itaú, Inter).

---

## 🎯 Marco 5: Frontend Mobile-First (Design System & Telas)
*Especificação de referência:* [specs/05-frontend-mobile-first.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/specs/05-frontend-mobile-first.md)
- [x] Setup do Vite + React + Tailwind CSS com tema Dark Mode / Âmbar.
- [x] Componentes de navegação: Bottom Navigation Bar (Mobile) e Sidebar retrátil (Desktop).
- [x] Componente Donut Chart com Recharts para visualização AUVP.
- [x] Cards de categorias com barras de progresso semânticas (verde/âmbar/vermelho).
- [x] Drawer / Modal de lançamento rápido (`+`) e upload de CSV.

---

## 🎯 Marco 6: Docker Compose & Infraestrutura Local
- [ ] Configurar `docker-compose.yml` orquestrando PostgreSQL, Backend e Frontend.
- [ ] Configurar volumes para hot-reload e persistência de dados do banco.
