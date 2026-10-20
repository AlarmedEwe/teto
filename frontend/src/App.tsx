import React from 'react';
import { BudgetSummaryResponseDTO } from '@teto/types';

const mockBudget: BudgetSummaryResponseDTO = {
  month: 10,
  year: 2026,
  totalIncome: 1000000, // R$ 10.000,00
  totalSpent: 420000,   // R$ 4.200,00
  balance: 580000,      // R$ 5.800,00
  categories: [
    {
      categoryId: '1',
      name: 'Custos Fixos',
      targetPct: 30,
      ceilingAmount: 300000,
      spentAmount: 250000,
      usedPct: 83.3,
      totalRealPct: 59.5,
      colorHex: '#3b82f6',
    },
    {
      categoryId: '2',
      name: 'Investimentos',
      targetPct: 25,
      ceilingAmount: 250000,
      spentAmount: 170000,
      usedPct: 68.0,
      totalRealPct: 40.5,
      colorHex: '#10b981',
    },
  ],
};

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-amber-500 mb-2">Teto</h1>
      <p className="text-neutral-400 mb-6">Gestão Orçamentária Doméstica (Mobile-First)</p>
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold text-neutral-200 mb-2">
          Resumo ({mockBudget.month}/{mockBudget.year})
        </h2>
        <p className="text-sm text-neutral-400">
          Renda: {(mockBudget.totalIncome / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <p className="text-sm text-emerald-400">
          Saldo Disponível: {(mockBudget.balance / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    </div>
  );
}
