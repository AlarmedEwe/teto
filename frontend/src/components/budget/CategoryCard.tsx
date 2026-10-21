import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { CategorySummaryItemDTO } from '@teto/types';
import { formatCurrency } from '../../utils/formatters.js';

interface CategoryCardProps {
  category: CategorySummaryItemDTO;
  onSelect?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect }) => {
  const isOverCeiling = category.usedPct >= 100;
  const isNearCeiling = category.usedPct >= 80 && category.usedPct < 100;

  // Cor da barra de progresso
  let progressColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  let cardBorder = 'border-neutral-800 hover:border-neutral-700';

  if (isOverCeiling) {
    progressColor = 'bg-rose-500';
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    cardBorder = 'border-rose-900/60 bg-rose-950/10';
  } else if (isNearCeiling) {
    progressColor = 'bg-amber-500';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    cardBorder = 'border-amber-900/40';
  }

  const remaining = category.ceilingAmount - category.spentAmount;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl bg-neutral-900/80 border ${cardBorder} shadow-lg transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden`}
    >
      {/* Indicador de cor superior */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: category.colorHex }}
      />

      {/* Header do Card */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-lg shrink-0 shadow-sm"
            style={{ backgroundColor: category.colorHex }}
          />
          <div>
            <h4 className="text-sm font-semibold text-neutral-100 leading-tight">
              {category.name}
            </h4>
            <span className="text-[11px] text-neutral-400 font-mono">
              Meta: {category.targetPct}% da renda
            </span>
          </div>
        </div>

        {/* Badge Semântico de Teto */}
        <div className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${badgeColor}`}>
          {isOverCeiling ? (
            <>
              <AlertCircle className="w-3 h-3" />
              <span>{category.usedPct}%</span>
            </>
          ) : isNearCeiling ? (
            <>
              <TrendingUp className="w-3 h-3" />
              <span>{category.usedPct}%</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3" />
              <span>{category.usedPct}%</span>
            </>
          )}
        </div>
      </div>

      {/* Valores */}
      <div className="flex items-baseline justify-between mt-1">
        <div>
          <span className="text-xs text-neutral-400">Gasto: </span>
          <span className="text-sm font-bold text-neutral-100">
            {formatCurrency(category.spentAmount)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-neutral-400">Teto: </span>
          <span className="text-xs font-semibold text-neutral-300">
            {formatCurrency(category.ceilingAmount)}
          </span>
        </div>
      </div>

      {/* Barra de Progresso do Teto */}
      <div className="space-y-1">
        <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(category.usedPct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
          <span>
            {isOverCeiling
              ? `Estourou em ${formatCurrency(Math.abs(remaining))}`
              : `Resta ${formatCurrency(remaining)}`}
          </span>
          <span>{category.totalRealPct}% do total</span>
        </div>
      </div>
    </div>
  );
};
