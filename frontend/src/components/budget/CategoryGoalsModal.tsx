import React, { useState } from 'react';
import { X, Sliders, Check, AlertTriangle } from 'lucide-react';
import { CategorySummaryItemDTO, UpdateCategoryItemDTO } from '@teto/types';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from '../common/CategoryIcon.js';

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
  const [icons, setIcons] = useState<Record<string, string | null>>(
    Object.fromEntries(categories.map((c) => [c.categoryId, c.icon || null]))
  );
  const [openIconPickerId, setOpenIconPickerId] = useState<string | null>(null);
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

  const handleIconChange = (catId: string, iconId: string) => {
    setIcons((prev) => ({
      ...prev,
      [catId]: iconId,
    }));
    setOpenIconPickerId(null);
  };

  const handleResetDefaultGoals = () => {
    const defaultMap: Record<string, { pct: number; icon: string }> = {
      'custos fixos': { pct: 30, icon: 'house' },
      'conforto': { pct: 10, icon: 'car' },
      'metas': { pct: 20, icon: 'bullseye' },
      'prazeres': { pct: 10, icon: 'wine-glass' },
      'investimentos': { pct: 25, icon: 'dollar-sign' },
      'conhecimento': { pct: 5, icon: 'graduation-cap' },
    };

    const newGoals: Record<string, number> = {};
    const newIcons: Record<string, string | null> = {};

    for (const cat of categories) {
      const matchKey = Object.keys(defaultMap).find((k) =>
        cat.name.toLowerCase().includes(k)
      );
      if (matchKey) {
        newGoals[cat.categoryId] = defaultMap[matchKey].pct;
        newIcons[cat.categoryId] = defaultMap[matchKey].icon;
      } else {
        newGoals[cat.categoryId] = 0;
        newIcons[cat.categoryId] = null;
      }
    }
    setGoals(newGoals);
    setIcons(newIcons);
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
        icon: icons[id] ?? null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-white">Minhas Metas Orçamentárias</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
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
            const currentIcon = icons[cat.categoryId];
            const isPickerOpen = openIconPickerId === cat.categoryId;

            return (
              <div
                key={cat.categoryId}
                className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Botão de Ícone com FontAwesome */}
                    <button
                      type="button"
                      onClick={() => setOpenIconPickerId(isPickerOpen ? null : cat.categoryId)}
                      title="Clique para alterar o ícone FontAwesome"
                      className="group relative cursor-pointer focus:outline-none"
                    >
                      <CategoryIcon
                        icon={currentIcon}
                        categoryName={cat.name}
                        colorHex={cat.colorHex}
                        variant="solid-circle"
                        size="xs"
                        className="group-hover:scale-105 transition-transform"
                      />
                    </button>
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

                {/* Seletor rápido de ícone FontAwesome */}
                {isPickerOpen && (
                  <div className="pt-2 border-t border-neutral-800">
                    <p className="text-[11px] text-neutral-400 mb-2 font-medium">Escolha um ícone FontAwesome:</p>
                    <div className="grid grid-cols-6 gap-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                      {AVAILABLE_CATEGORY_ICONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleIconChange(cat.categoryId, opt.id)}
                          title={opt.label}
                          className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                            currentIcon === opt.id
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
                        >
                          <CategoryIcon icon={opt.id} variant="pure" size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaultGoals}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Restaurar Metas Recomendadas
            </button>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isOver100}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              {loading ? (
                'Salvando...'
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Metas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
