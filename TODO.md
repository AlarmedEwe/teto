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
*Especificação de referência:* `specs/02-database-e-backend-core.md` (a definir)

- [ ] Inicializar Fastify/Express no `backend/src/server.ts`.
- [ ] Configurar Prisma ORM com schema PostgreSQL refletindo o modelo de dados do [GEMINI.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/GEMINI.md).
- [ ] Gerar migration inicial e seed com as categorias padrão AUVP (30/10/20/10/25/5).
- [ ] Implementar middleware de tratamento de erros e resposta padronizada.

---

## 🎯 Marco 3: Módulo de Orçamento & Cálculo de Tetos
- [ ] Implementar módulo `budget` (service + controller + rotas).
- [ ] Implementar cálculos de teto por categoria a partir da renda informada.
- [ ] Implementar cálculo de percentual utilizado e percentual do gasto total.
- [ ] Criar testes unitários para as fórmulas matemáticas do teto.

---

## 🎯 Marco 4: Parser de CSV & Projeção de Parcelamentos
- [ ] Implementar módulo de upload multipart/form-data.
- [ ] Implementar parser tolerante a delimitadores (`,`, `;`) e separadores decimais.
- [ ] Implementar regex de detecção de parcelamento (`02/05`, `Parcela 2 de 5`).
- [ ] Implementar gerador de transações futuras com `installment_group_id`.
- [ ] Testes unitários com fixtures de faturas reais (Nubank, Itaú, Inter).

---

## 🎯 Marco 5: Frontend Mobile-First (Design System & Telas)
- [ ] Setup do Vite + React + Tailwind CSS com tema Dark Mode / Âmbar.
- [ ] Componentes de navegação: Bottom Navigation Bar (Mobile) e Sidebar retrátil (Desktop).
- [ ] Componente Donut Chart com Recharts para visualização AUVP.
- [ ] Cards de categorias com barras de progresso semânticas (verde/âmbar/vermelho).
- [ ] Drawer / Modal de lançamento rápido (`+`) e upload de CSV.

---

## 🎯 Marco 6: Docker Compose & Infraestrutura Local
- [ ] Configurar `docker-compose.yml` orquestrando PostgreSQL, Backend e Frontend.
- [ ] Configurar volumes para hot-reload e persistência de dados do banco.
