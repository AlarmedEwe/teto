import React from 'react';
import { ChevronLeft, ChevronRight, Coins, LogIn, LogOut } from 'lucide-react';
import { formatCurrency, getMonthName } from '../../utils/formatters.js';
import { WorkspaceSwitcher } from '../workspaces/WorkspaceSwitcher.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { WorkspaceType } from '@teto/types';

interface HeaderProps {
  year: number;
  month: number;
  totalIncome: number;
  totalSpent: number;
  balance: number;
  cumulativeBalance?: number;
  workspaceType?: WorkspaceType;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenIncomeTransaction: () => void;
  onOpenCreateWorkspace: () => void;
  onOpenInviteMember: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  year,
  month,
  totalIncome,
  totalSpent,
  balance,
  cumulativeBalance,
  workspaceType = WorkspaceType.BUDGET,
  onPrevMonth,
  onNextMonth,
  onOpenIncomeTransaction,
  onOpenCreateWorkspace,
  onOpenInviteMember,
}) => {
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const isCumulative = workspaceType === WorkspaceType.CUMULATIVE;
  const isDeficit = balance < 0;

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-neutral-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand & Workspace Switcher */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Coins className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-tight">Teto</span>
              <p className="text-[10px] text-neutral-400 hidden md:block">Arcabouço Fiscal Doméstico</p>
            </div>
          </div>

          {/* Seletor de Espaço */}
          <WorkspaceSwitcher
            onOpenCreateWorkspace={onOpenCreateWorkspace}
            onOpenInviteMember={onOpenInviteMember}
          />
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

        {/* Resumo Rápido & Ações de Usuário */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Seletor de Mês (Mobile) */}
          <div className="flex sm:hidden items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 shrink-0">
            <button
              onClick={onPrevMonth}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Mês anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-semibold px-1 text-neutral-200">
              {getMonthName(month).slice(0, 3)}/{year}
            </span>
            <button
              onClick={onNextMonth}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Próximo mês"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards de Resumo */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenIncomeTransaction}
              className="flex flex-col p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-800/80 transition text-left group"
              title={isCumulative ? 'Clique para lançar aportes na reserva' : 'Clique para lançar renda / salário'}
            >
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium group-hover:text-emerald-400 flex items-center gap-1">
                {isCumulative ? 'Aportes ＋' : 'Renda ＋'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-400 truncate">
                {formatCurrency(totalIncome)}
              </span>
            </button>

            <div className="flex flex-col p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">
                {isCumulative ? 'Resgates' : 'Gasto Total'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-200 truncate">
                {formatCurrency(totalSpent)}
              </span>
            </div>

            <div
              className={`flex flex-col p-1.5 sm:px-3 sm:py-1.5 rounded-xl border ${
                isCumulative
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : isDeficit
                  ? 'bg-rose-950/20 border-rose-800/40 text-rose-400'
                  : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
              }`}
            >
              <span className="text-[9px] sm:text-[10px] opacity-80 font-medium">
                {isCumulative ? 'Saldo Total' : 'Saldo do Mês'}
              </span>
              <span className="text-xs sm:text-sm font-bold truncate">
                {formatCurrency(isCumulative && cumulativeBalance !== undefined ? cumulativeBalance : balance)}
              </span>
            </div>
          </div>

          {/* Botão de Autenticação / Perfil */}
          {user ? (
            <button
              onClick={logout}
              title={`Conectado como ${user.email} (Clique para sair)`}
              className="hidden lg:flex p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-850 transition border border-neutral-800 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 text-xs font-semibold text-neutral-200 transition shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-500" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
