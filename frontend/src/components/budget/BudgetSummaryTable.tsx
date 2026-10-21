import React from 'react';
import { Sliders, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { CategorySummaryItemDTO } from '@teto/types';
import { formatCurrency } from '../../utils/formatters.js';
import { CategoryIcon } from '../common/CategoryIcon.js';

interface BudgetSummaryTableProps {
  categories: CategorySummaryItemDTO[];
  totalSpent: number;
  totalIncome: number;
  onOpenGoalsModal: () => void;
}

export const BudgetSummaryTable: React.FC<BudgetSummaryTableProps> = ({
  categories,
  totalSpent,
  totalIncome,
  onOpenGoalsModal,
}) => {
  const totalCeilings = categories.reduce((acc, c) => acc + c.ceilingAmount, 0);
  const overallUsedPct = totalCeilings > 0 ? Math.round((totalSpent / totalCeilings) * 100) : 0;

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header do Resumo */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Resumo Orçamentário</h3>
          <p className="text-xs text-neutral-400">Tetos e limites calculados por categoria</p>
        </div>
        <button
          onClick={onOpenGoalsModal}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Ajustar Metas</span>
        </button>
      </div>

      {/* --- VISÃO DESKTOP (Tabela Limpa Inspirada na Referência) --- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Budget / Categoria</th>
              <th className="py-2.5 px-3 text-right">Valor Gasto</th>
              <th className="py-2.5 px-3 text-right">Devo Gastar (Teto)</th>
              <th className="py-2.5 px-3 text-center">Utilizado</th>
              <th className="py-2.5 px-3 text-right">Total Real</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-medium">
            {categories.map((c) => {
              const isOver = c.usedPct >= 100;
              const isNear = c.usedPct >= 80 && c.usedPct < 100;

              let textColor = 'text-emerald-400';
              let barColor = 'bg-emerald-500';

              if (isOver) {
                textColor = 'text-rose-400';
                barColor = 'bg-rose-500';
              } else if (isNear) {
                textColor = 'text-amber-400';
                barColor = 'bg-amber-500';
              }

              return (
                <tr
                  key={c.categoryId}
                  className="hover:bg-neutral-800/40 transition-colors group"
                >
                  {/* Nome & Meta */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon
                        icon={c.icon}
                        categoryName={c.name}
                        colorHex={c.colorHex}
                        variant="badge"
                        size="xs"
                      />
                      <span className="text-neutral-100 font-semibold group-hover:text-white transition">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        ({c.targetPct}%)
                      </span>
                    </div>
                  </td>

                  {/* Valor Gasto */}
                  <td className="py-3 px-3 text-right font-mono font-semibold text-neutral-100">
                    {formatCurrency(c.spentAmount)}
                  </td>

                  {/* Devo Gastar / Teto */}
                  <td className="py-3 px-3 text-right font-mono text-neutral-400">
                    {formatCurrency(c.ceilingAmount)}
                  </td>

                  {/* Utilizado (%) com Mini-Barra */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`font-mono font-bold ${textColor}`}>
                        {c.usedPct}%
                      </span>
                      <div className="w-14 bg-neutral-800 rounded-full h-1 overflow-hidden mt-1">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(c.usedPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Fatia do Total Gasto */}
                  <td className="py-3 px-3 text-right font-mono text-neutral-400">
                    {c.totalRealPct}%
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Rodapé com Totais Consolidados */}
          <tfoot>
            <tr className="border-t-2 border-neutral-800 text-xs font-bold text-neutral-200">
              <td className="py-3.5 px-3">Total do Mês</td>
              <td className="py-3.5 px-3 text-right font-mono text-white">
                {formatCurrency(totalSpent)}
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-neutral-400">
                {formatCurrency(totalCeilings)}
              </td>
              <td className="py-3.5 px-3 text-center font-mono">
                <span
                  className={
                    overallUsedPct >= 100
                      ? 'text-rose-400'
                      : overallUsedPct >= 80
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }
                >
                  {overallUsedPct}%
                </span>
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-neutral-400">
                {totalSpent > 0 ? '100%' : '0%'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* --- VISÃO MOBILE (Linhas Compactas com Micro-Barra) --- */}
      <div className="md:hidden space-y-2">
        {categories.map((c) => {
          const isOver = c.usedPct >= 100;
          const isNear = c.usedPct >= 80 && c.usedPct < 100;

          let badgeStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          let barColor = 'bg-emerald-500';

          if (isOver) {
            badgeStyle = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            barColor = 'bg-rose-500';
          } else if (isNear) {
            badgeStyle = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            barColor = 'bg-amber-500';
          }

          return (
            <div
              key={c.categoryId}
              className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-2 shadow-sm"
            >
              {/* Linha Única: [Ícone + Nome + Meta] e [Gasto / Teto + Badge] */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CategoryIcon
                    icon={c.icon}
                    categoryName={c.name}
                    colorHex={c.colorHex}
                    variant="solid-circle"
                    size="xs"
                  />
                  <span className="text-xs font-bold text-neutral-200 truncate">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                    {c.targetPct}%
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right text-[11px] font-mono leading-tight">
                    <span className="font-bold text-white">
                      {formatCurrency(c.spentAmount)}
                    </span>
                    <span className="text-neutral-500 block text-[10px]">
                      / {formatCurrency(c.ceilingAmount)}
                    </span>
                  </div>

                  <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold font-mono ${badgeStyle}`}>
                    {c.usedPct}%
                  </span>
                </div>
              </div>

              {/* Micro-Barra de 2px na base */}
              <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(c.usedPct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Rodapé Mobile */}
        <div className="pt-2 px-1 flex items-center justify-between text-xs font-semibold text-neutral-400 border-t border-neutral-800/80">
          <span>Gasto Total: <strong className="text-white font-mono">{formatCurrency(totalSpent)}</strong></span>
          <span>Teto Total: <strong className="text-neutral-200 font-mono">{formatCurrency(totalCeilings)}</strong></span>
        </div>
      </div>
    </div>
  );
};
