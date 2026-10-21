import React, { useState } from 'react';
import { X, DollarSign, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIncome: number; // centavos
  onSave: (cents: number) => Promise<void>;
  month: number;
  year: number;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  currentIncome,
  onSave,
  month,
  year,
}) => {
  const [valueStr, setValueStr] = useState((currentIncome / 100).toFixed(2).replace('.', ','));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedNum = parseFloat(valueStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(parsedNum) || parsedNum < 0) {
      setError('Informe um valor de renda válido maior ou igual a zero');
      return;
    }

    try {
      setLoading(true);
      const cents = Math.round(parsedNum * 100);
      await onSave(cents);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar renda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-dropdown border border-neutral-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Renda do Mês</h3>
            <p className="text-xs text-neutral-400">{month}/{year}</p>
          </div>
        </div>

        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
          O teto de todas as categorias é calculado a partir da sua renda líquida cadastrada para este mês.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Renda Líquida (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold text-sm">
                R$
              </span>
              <input
                type="text"
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
                placeholder="0,00"
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl py-2.5 pl-10 pr-4 text-white text-base font-semibold focus:outline-none focus:border-amber-500 transition"
                autoFocus
              />
            </div>
            <span className="text-[11px] text-neutral-400 block mt-1">
              Valor atual: {formatCurrency(currentIncome)}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 text-sm font-semibold hover:bg-neutral-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
