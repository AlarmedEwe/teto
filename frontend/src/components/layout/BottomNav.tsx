import React, { useState } from 'react';
import { LayoutDashboard, Receipt, Sliders, Plus, Upload, DollarSign } from 'lucide-react';

export type NavTab = 'dashboard' | 'transactions' | 'goals';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenTransactionModal: () => void;
  onOpenIncomeModal: () => void;
  onOpenCsvModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenTransactionModal,
  onOpenIncomeModal,
  onOpenCsvModal,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sm:hidden">
      {/* Menu Radial / Flutuante do FAB */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-6 pb-24">
          <div className="glass-panel p-3 rounded-2xl border border-neutral-700/80 shadow-2xl space-y-2 max-w-xs mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-200">
            <span className="text-[11px] font-semibold text-neutral-400 px-3 uppercase tracking-wider block">
              Ações Rápidas
            </span>
            <button
              onClick={() => { setMenuOpen(false); onOpenTransactionModal(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span>Novo Gasto / Receita</span>
            </button>
            <button
              onClick={() => { setMenuOpen(false); onOpenCsvModal(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <span>Importar Fatura CSV</span>
            </button>
            <button
              onClick={() => { setMenuOpen(false); onOpenIncomeModal(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <span>Ajustar Renda do Mês</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra Inferior Fixa */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-neutral-800/80 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => { setMenuOpen(false); onTabChange('dashboard'); }}
          className={`flex flex-col items-center gap-1 p-1 transition ${
            activeTab === 'dashboard' ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        {/* Botão Central Flutuante (+) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`-mt-6 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-95 transition-transform ${
            menuOpen ? 'rotate-45' : ''
          }`}
          title="Ações rápidas"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => { setMenuOpen(false); onTabChange('transactions'); }}
          className={`flex flex-col items-center gap-1 p-1 transition ${
            activeTab === 'transactions' ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] font-medium">Extrato</span>
        </button>

        <button
          onClick={() => { setMenuOpen(false); onTabChange('goals'); }}
          className={`flex flex-col items-center gap-1 p-1 transition ${
            activeTab === 'goals' ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-medium">Metas</span>
        </button>
      </nav>
    </div>
  );
};
