# Spec 02: Backend Core, Banco de Dados & Prisma ORM

Especificação técnica para inicialização do servidor Fastify, modelagem relacional via Prisma ORM, container do PostgreSQL e seed inicial das categorias padrão de tetos.

---

## 1. Objetivo & Contexto
Construir a fundação do backend da aplicação **Teto**, provendo:
- Servidor HTTP de alta performance com **Fastify** e CORS configurado.
- Conexão e pooling de banco com **Prisma ORM** e **PostgreSQL 16**.
- Modelagem relacional fiel à Seção 3 do [GEMINI.md](file:///media/upd8-guilherme/TOSHIBA%20EXT/G/dev/node/teto/GEMINI.md).
- Precisão monetária estrita em centavos (`Int` no Prisma / banco).
- Seed automático com as 6 categorias padrão de tetos (30/10/20/10/25/5).
- Docker Compose com serviço `db` para desenvolvimento local.

---

## 2. Modelagem Relacional (`backend/prisma/schema.prisma`)

### 2.1 Enums do Prisma
- `TransactionType`: `EXPENSE`, `INCOME`
- `TransactionSource`: `MANUAL`, `CREDIT_CARD_CSV`

### 2.2 Tabelas e Mapeamento
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum TransactionType {
  EXPENSE
  INCOME
}

enum TransactionSource {
  MANUAL
  CREDIT_CARD_CSV
}

model User {
  id              String          @id @default(uuid())
  name            String
  email           String          @unique
  createdAt       DateTime        @default(now()) @map("created_at")

  categories      Category[]
  monthlyBudgets  MonthlyBudget[]
  transactions    Transaction[]

  @@map("users")
}

model Category {
  id              String          @id @default(uuid())
  userId          String          @map("user_id")
  name            String
  defaultPct      Int             @map("default_pct") // Ex: 30 para 30%
  colorHex        String          @map("color_hex")

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions    Transaction[]

  @@map("categories")
}

model MonthlyBudget {
  id              String          @id @default(uuid())
  userId          String          @map("user_id")
  month           Int             // 1-12
  year            Int             // Ex: 2026
  totalIncome     Int             @default(0) @map("total_income") // Centavos

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions    Transaction[]

  @@unique([userId, month, year])
  @@map("monthly_budgets")
}

model Transaction {
  id                  String            @id @default(uuid())
  userId              String            @map("user_id")
  categoryId          String?           @map("category_id")
  monthlyBudgetId     String            @map("monthly_budget_id")
  description         String
  amount              Int               // Centavos
  date                DateTime          @db.Date
  type                TransactionType   @default(EXPENSE)
  source              TransactionSource @default(MANUAL)
  installmentGroupId  String?           @map("installment_group_id")
  currentInstallment  Int?              @map("current_installment")
  totalInstallments   Int?              @map("total_installments")
  createdAt           DateTime          @default(now()) @map("created_at")

  user                User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  category            Category?         @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  monthlyBudget       MonthlyBudget     @relation(fields: [monthlyBudgetId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([monthlyBudgetId])
  @@map("transactions")
}
```

---

## 3. Seed de Categorias Padrão de Tetos
O seed deve garantir a existência de um usuário padrão (`default@teto.local`) e as 6 categorias com suas cores e percentuais:
1. **Custos Fixos**: `30%`, `#3b82f6` (Azul)
2. **Conforto**: `10%`, `#06b6d4` (Ciano)
3. **Metas**: `20%`, `#f59e0b` (Âmbar)
4. **Prazeres**: `10%`, `#ec4899` (Rosa)
5. **Investimentos**: `25%`, `#10b981` (Esmeralda)
6. **Conhecimento**: `5%`, `#8b5cf6` (Roxo)

---

## 4. Servidor Fastify (`backend/src/server.ts`)
- Plugins: `@fastify/cors`, `@fastify/sensible`.
- Rotas:
  - `GET /health`: Retorna status da API, timestamp e conexão com o banco.
- Tratamento de erro padronizado para validação e erros internos.

---

## 5. Critérios de Aceite
1. [ ] `docker-compose.yml` inicializado com container Postgres funcional na porta 5432.
2. [ ] Schema Prisma criado e validado (`npx prisma validate`).
3. [ ] Migration executada criando as tabelas com integridade referencial e índices.
4. [ ] Script `seed.ts` executando com sucesso e cadastrando categorias padrão.
5. [ ] Servidor Fastify respondendo com sucesso em `http://localhost:3333/health`.
