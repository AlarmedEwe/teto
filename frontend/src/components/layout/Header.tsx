import React from 'react';
import { ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { formatCurrency, getMonthName } from '../../utils/formatters.js';

interface HeaderProps {
  year: number;
  month: number;
  totalIncome: number;
  totalSpent: number;
  balance: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenIncomeTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  year,
  month,
  totalIncome,
  totalSpent,
  balance,
  onPrevMonth,
  onNextMonth,
  onOpenIncomeTransaction,
}) => {
  const isDeficit = balance < 0;

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-neutral-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand & Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Coins className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">Teto</span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">Arcabouço Fiscal Doméstico</p>
            </div>
          </div>

          {/* Seletor de Mês (Mobile) */}
          <div className="flex sm:hidden items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={onPrevMonth}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-neutral-200">
              {getMonthName(month).slice(0, 3)}/{year}
            </span>
            <button
              onClick={onNextMonth}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Seletor de Mês (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-2 py-1 rounded-xl shadow-inner">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-neutral-200 min-w-32 text-center">
            {getMonthName(month)} de {year}
          </span>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
          <button
            onClick={onOpenIncomeTransaction}
            className="flex flex-col p-2 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-800/80 transition text-left group"
            title="Clique para lançar ou adicionar renda / salário"
          >
            <span className="text-[10px] text-neutral-400 font-medium group-hover:text-emerald-400 flex items-center gap-1">
              Renda ＋
            </span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-400 truncate">
              {formatCurrency(totalIncome)}
            </span>
          </button>

          <div className="flex flex-col p-2 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 font-medium">Gasto Total</span>
            <span className="text-xs sm:text-sm font-semibold text-neutral-200 truncate">
              {formatCurrency(totalSpent)}
            </span>
          </div>

          <div className={`flex flex-col p-2 sm:px-3 sm:py-1.5 rounded-xl border ${
            isDeficit
              ? 'bg-rose-950/20 border-rose-800/40 text-rose-400'
              : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
          }`}>
            <span className="text-[10px] opacity-80 font-medium">Saldo</span>
            <span className="text-xs sm:text-sm font-bold truncate">
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
