import React, { useState } from 'react';
import { X, Sliders, Check, AlertTriangle } from 'lucide-react';
import { CategorySummaryItemDTO, UpdateCategoryItemDTO } from '@teto/types';

interface CategoryGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategorySummaryItemDTO[];
  onSave: (items: UpdateCategoryItemDTO[]) => Promise<void>;
}

export const CategoryGoalsModal: React.FC<CategoryGoalsModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSave,
}) => {
  const [goals, setGoals] = useState<Record<string, number>>(
    Object.fromEntries(categories.map((c) => [c.categoryId, c.targetPct]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPct = Object.values(goals).reduce((acc, curr) => acc + (curr || 0), 0);
  const isOver100 = totalPct > 100;

  const handlePctChange = (catId: string, val: number) => {
    setGoals((prev) => ({
      ...prev,
      [catId]: Math.max(0, val),
    }));
  };

  const handleResetDefaultGoals = () => {
    // Reset para as metas padrão: 30 / 10 / 20 / 10 / 25 / 5
    const defaultMap: Record<string, number> = {
      'custos fixos': 30,
      'conforto': 10,
      'metas': 20,
      'prazeres': 10,
      'investimentos': 25,
      'conhecimento': 5,
    };

    const newGoals: Record<string, number> = {};
    for (const cat of categories) {
      const matchKey = Object.keys(defaultMap).find((k) =>
        cat.name.toLowerCase().includes(k)
      );
      newGoals[cat.categoryId] = matchKey ? defaultMap[matchKey] : 0;
    }
    setGoals(newGoals);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOver100) {
      setError(`A soma das metas (${totalPct}%) não pode exceder 100%`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload: UpdateCategoryItemDTO[] = Object.entries(goals).map(([id, defaultPct]) => ({
        id,
        defaultPct,
      }));
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar metas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-dropdown border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4 pr-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Metas & Tetos</h3>
              <p className="text-xs text-neutral-400">Distribuição percentual da renda</p>
            </div>
          </div>
        </div>

        {/* Totalizador Percentual */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between mb-4 ${
          isOver100
            ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
            : totalPct === 100
            ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
            : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isOver100 && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>Total Alocado:</span>
          </div>
          <span className="text-sm font-bold font-mono">{totalPct}% / 100%</span>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {categories.map((cat) => {
            const currentVal = goals[cat.categoryId] ?? cat.targetPct;
            return (
              <div
                key={cat.categoryId}
                className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.colorHex }}
                  />
                  <span className="text-sm font-semibold text-neutral-200 truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentVal}
                    onChange={(e) => handlePctChange(cat.categoryId, parseInt(e.target.value, 10) || 0)}
                    className="w-16 bg-neutral-800 border border-neutral-700 rounded-lg py-1 px-2 text-center text-white text-sm font-bold focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="text-xs text-neutral-400 font-semibold">%</span>
                </div>
              </div>
            );
          })}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaultGoals}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Restaurar Metas Padrão (30/10/20/10/25/5)
            </button>
          </div>

          <div className="flex gap-2 pt-2 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 text-sm font-semibold hover:bg-neutral-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isOver100}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'Salvando...' : 'Salvar Metas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
