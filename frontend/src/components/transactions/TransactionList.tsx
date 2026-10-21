import React from 'react';
import { CreditCard, Calendar, Tag, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CategorySummaryItemDTO, TransactionResponseDTO, TransactionType } from '@teto/types';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

interface TransactionListProps {
  transactions: TransactionResponseDTO[];
  categories: CategorySummaryItemDTO[];
  onUpdateCategory: (transactionId: string, categoryId: string | null) => Promise<void>;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onUpdateCategory,
}) => {
  const categoryMap = new Map(categories.map((c) => [c.categoryId, c]));

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center bg-neutral-900/40 border border-neutral-800/80 rounded-2xl">
        <CreditCard className="w-10 h-10 text-neutral-600 mx-auto mb-2 stroke-[1.5]" />
        <p className="text-sm font-semibold text-neutral-300">Nenhuma transação neste mês</p>
        <p className="text-xs text-neutral-500 mt-1">
          Faça um lançamento manual ou importe sua fatura de cartão via CSV.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {transactions.map((tx) => {
        const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
        const isExpense = tx.type === TransactionType.EXPENSE;
        const hasInstallment = tx.currentInstallment && tx.totalInstallments;

        return (
          <div
            key={tx.id}
            className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700/80 transition flex items-center justify-between gap-3 shadow-md"
          >
            {/* Ícone e Descrição */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isExpense
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {isExpense ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-semibold text-neutral-100 truncate">
                    {tx.description}
                  </h5>
                  {hasInstallment && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 font-mono">
                      <CreditCard className="w-2.5 h-2.5" />
                      {tx.currentInstallment}/{tx.totalInstallments}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    {formatDate(tx.date)}
                  </span>

                  {/* Seletor rápido de Categoria */}
                  {isExpense && (
                    <div className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat ? cat.colorHex : '#737373' }}
                      />
                      <select
                        value={tx.categoryId || ''}
                        onChange={(e) => onUpdateCategory(tx.id, e.target.value || null)}
                        className="bg-transparent text-[11px] font-medium text-neutral-300 hover:text-white cursor-pointer focus:outline-none truncate max-w-36"
                      >
                        <option value="" className="bg-neutral-900 text-neutral-400">
                          Pendente de Categoria
                        </option>
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId} className="bg-neutral-900 text-white">
                            {c.name} ({c.targetPct}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Valor */}
            <div className="text-right shrink-0">
              <span
                className={`text-sm font-bold font-mono ${
                  isExpense ? 'text-neutral-100' : 'text-emerald-400'
                }`}
              >
                {isExpense ? '-' : '+'}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
