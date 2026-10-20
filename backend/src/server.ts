import { Transaction, TransactionType, TransactionSource } from '@teto/types';

console.log('Teto Backend initializing...');

const sampleTransaction: Transaction = {
  id: 'uuid-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  monthlyBudgetId: 'budget-1',
  description: 'Aluguel e Condomínio',
  amount: 150000, // R$ 1.500,00 (em centavos)
  date: '2026-10-20',
  type: TransactionType.EXPENSE,
  source: TransactionSource.MANUAL,
  createdAt: new Date(),
};

console.log('Sample transaction model loaded successfully:', sampleTransaction.description);
