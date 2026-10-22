import React from 'react';
import { LayoutDashboard, Receipt, Sliders, Plus, Upload, DollarSign, ShieldCheck, LogIn, LogOut } from 'lucide-react';
import { NavTab } from './BottomNav.js';
import { useAuth } from '../../contexts/AuthContext.js';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenTransactionModal: () => void;
  onOpenIncomeTransaction: () => void;
  onOpenCsvModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenTransactionModal,
  onOpenIncomeTransaction,
  onOpenCsvModal,
}) => {
  const { user, logout, setIsAuthModalOpen } = useAuth();

  return (
    <aside className="hidden sm:flex flex-col w-64 border-r border-neutral-800/80 bg-neutral-950/80 p-5 shrink-0 justify-between min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {/* Navegação Principal */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 block">
            Navegação
          </span>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Tetos</span>
          </button>

          <button
            onClick={() => onTabChange('transactions')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'transactions'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Extrato & Parcelas</span>
          </button>

          <button
            onClick={() => onTabChange('goals')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'goals'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Metas & Tetos</span>
          </button>
        </div>

        {/* Botões de Ação Direta */}
        <div className="space-y-2 pt-4 border-t border-neutral-800/80">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 block">
            Lançamentos
          </span>
          <button
            onClick={onOpenTransactionModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Gasto</span>
          </button>

          <button
            onClick={onOpenCsvModal}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-sm font-semibold transition hover:bg-neutral-800/80"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Importar CSV</span>
          </button>

          <button
            onClick={onOpenIncomeTransaction}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 text-neutral-200 text-sm font-semibold transition hover:bg-neutral-800/80"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>+ Nova Renda</span>
          </button>
        </div>
      </div>

      {/* Footer da Sidebar com Usuário */}
      <div className="pt-4 border-t border-neutral-800/80 space-y-2">
        {user ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-neutral-900/90 border border-neutral-800">
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">{user.name}</span>
              <span className="text-[10px] text-neutral-400 block truncate">{user.email}</span>
            </div>
            <button
              onClick={logout}
              title="Sair da conta"
              className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Acessar / Criar Conta</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 text-neutral-400 px-1">
          <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="text-[10px]">Argon2id (RFC 9106) Ativo</span>
        </div>
      </div>
    </aside>
  );
};
