# Spec 04: Parser de CSV & Projeção de Parcelamentos

Especificação técnica do motor de parsing de faturas/extratos CSV, detecção inteligente de parcelas via expressões regulares, projeção automática em meses subsequentes e endpoints de transações.

---

## 1. Regras de Negócio do Parser de CSV

### 1.1 Resiliência de Formatos
Extratos bancários brasileiros variam frequentemente de estrutura. O parser deve suportar:
- **Delimitadores:** Vírgula (`,`) ou Ponto e Vírgula (`;`).
- **Separadores Decimais:** Ponto (`150.50`) ou Vírgula (`150,50` ou `-150,50`).
- **Padrões de Data:**
  - ISO: `YYYY-MM-DD` (ex: `2026-10-15`)
  - Padrão BR: `DD/MM/YYYY` (ex: `15/10/2026`)
- **Conversão Monetária:** Todos os valores são normalizados para centavos inteiros (`Math.round(Math.abs(amountFloat) * 100)`). Gastos com sinal negativo no extrato de cartão são tratados como `EXPENSE`.

### 1.2 Detecção de Parcelamento
O parser inspeciona o descritivo da transação procurando padrões como:
1. `(02/05)` ou `[02/05]`
2. `02/05` ou `2/5`
3. `Parcela 2 de 5` ou `Parcela 02 de 10`
4. `(2 de 5)` ou `[2 de 5]`

Se o padrão for encontrado com $X$ (parcela atual) e $N$ (total de parcelas) onde $1 \le X \le N$:
- A transação atual recebe `currentInstallment = X` e `totalInstallments = N`.
- É gerado um `installmentGroupId = uuid()`.
- **Projeção Futura:** O sistema gera automaticamente $N - X$ transações futuras com datas espaçadas mês a mês ($M+1, M+2, \dots$), vinculadas aos respectivos `monthly_budgets` e compartilhando o mesmo `installmentGroupId`, categoria e valor.

---

## 2. Contratos de API Utilizados (de `@teto/types`)

### 2.1 Criar Transação Manual
- `POST /api/transactions`
  - Body (`CreateTransactionDTO`):
    ```typescript
    {
      categoryId?: string | null;
      description: string;
      amount: number; // centavos
      date: string;   // YYYY-MM-DD
      type: TransactionType;
      source?: TransactionSource;
    }
    ```
  - Response: `TransactionResponseDTO` (HTTP 201).

### 2.2 Importação de CSV
- `POST /api/transactions/import-csv`
  - Content-Type: `multipart/form-data` (campo `file`).
  - Response (`ImportCsvResponseDTO`):
    ```typescript
    {
      totalProcessed: number;
      transactionsCreated: number;
      pendingCategorization: number;
      items: ImportCsvItemDTO[];
    }
    ```

### 2.3 Atualização de Categoria (Conciliação Rápida)
- `PATCH /api/transactions/:id/category`
  - Body (`UpdateTransactionCategoryDTO`): `{ categoryId: string | null }`
  - Response: `TransactionResponseDTO`.

---

## 3. Estrutura Modular no Backend

```
backend/src/
├── modules/
│   └── transactions/
│       ├── csv-parser.ts             # Parser puro de CSV com detecção de delimitador e valores
│       ├── installment-detector.ts   # Regex e extração de parcelas (X de N)
│       ├── transactions.service.ts   # Orquestração no banco, criação de budgets e parcelas
│       ├── transactions.controller.ts
│       └── transactions.routes.ts
└── test/
    ├── csv-parser.test.ts
    └── installment-detector.test.ts
```

---

## 4. Critérios de Aceite
1. [ ] Testes unitários para `installment-detector` cobrindo padrões `(02/05)`, `2/10`, `Parcela 3 de 12` e descritivos sem parcelas.
2. [ ] Testes unitários para `csv-parser` cobrindo formatos com vírgula e ponto-e-vírgula, datas BR e ISO, valores positivos e negativos.
3. [ ] Projeção correta de $N - X$ parcelas futuras atreladas aos meses correspondentes com o mesmo `installmentGroupId`.
4. [ ] Endpoint multipart `POST /api/transactions/import-csv` processando arquivo e persistindo transações com projeção de parcelas.
5. [ ] Endpoint `PATCH /api/transactions/:id/category` permitindo alteração rápida pós-upload.
6. [ ] Suíte de testes passando com sucesso via `npm test`.
