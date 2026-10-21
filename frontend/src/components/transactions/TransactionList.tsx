import React, { useState } from 'react';
import { CreditCard, Calendar, ArrowUpRight, ArrowDownLeft, Pencil } from 'lucide-react';
import { CategorySummaryItemDTO, TransactionResponseDTO, TransactionType } from '@teto/types';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { CategoryIcon } from '../common/CategoryIcon.js';
import { CategoryFilterBar } from '../common/CategoryFilterBar.js';

interface TransactionListProps {
  transactions: TransactionResponseDTO[];
  categories: CategorySummaryItemDTO[];
  onUpdateCategory?: (transactionId: string, categoryId: string | null) => Promise<void>;
  onEditTransaction?: (transaction: TransactionResponseDTO) => void;
  showFilter?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onUpdateCategory,
  onEditTransaction,
  showFilter = true,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const categoryMap = new Map(categories.map((c) => [c.categoryId, c]));

  const filteredTransactions = selectedCategoryId
    ? transactions.filter((tx) => tx.categoryId === selectedCategoryId)
    : transactions;

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
    <div className="space-y-3">
      {/* Barra de Filtro de Categorias por Ícones (FontAwesome) */}
      {showFilter && categories.length > 0 && (
        <div className="pb-1">
          <CategoryFilterBar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <div className="p-6 text-center bg-neutral-900/30 border border-neutral-800/60 rounded-2xl text-xs text-neutral-400">
          Nenhuma transação encontrada para a categoria selecionada.
        </div>
      ) : (
        filteredTransactions.map((tx) => {
          const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
          const isExpense = tx.type === TransactionType.EXPENSE;
          const hasInstallment = tx.currentInstallment && tx.totalInstallments;

          return (
            <div
              key={tx.id}
              onClick={() => onEditTransaction && onEditTransaction(tx)}
              className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700/80 transition flex items-center justify-between gap-3 shadow-md cursor-pointer group"
            >
              {/* Ícone e Descrição */}
              <div className="flex items-center gap-3 min-w-0">
                {isExpense && cat ? (
                  <CategoryIcon
                    icon={cat.icon}
                    categoryName={cat.name}
                    colorHex={cat.colorHex}
                    variant="badge"
                    size="md"
                  />
                ) : (
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
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-400 transition truncate">
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
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      {formatDate(tx.date)}
                    </span>

                    {/* Categoria com ícone FontAwesome */}
                    {isExpense && (
                      <span className="flex items-center gap-1.5 truncate">
                        <CategoryIcon
                          icon={cat?.icon}
                          categoryName={cat?.name}
                          colorHex={cat ? cat.colorHex : '#737373'}
                          variant="pure"
                          size="xs"
                        />
                        <span className="truncate text-neutral-300">
                          {cat ? `${cat.name} (${cat.targetPct}%)` : 'Pendente de Categoria'}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Valor e Ações */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <span
                    className={`text-sm font-bold font-mono ${
                      isExpense ? 'text-neutral-100' : 'text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>

                {onEditTransaction && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTransaction(tx);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition"
                    title="Editar lançamento"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
