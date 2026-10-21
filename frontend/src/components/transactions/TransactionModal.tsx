import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Tag, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { CategorySummaryItemDTO, CreateTransactionDTO, TransactionResponseDTO, TransactionType } from '@teto/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategorySummaryItemDTO[];
  onSave: (data: CreateTransactionDTO) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  defaultDate?: string;
  initialType?: TransactionType;
  initialDescription?: string;
  editingTransaction?: TransactionResponseDTO | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSave,
  onDelete,
  defaultDate,
  initialType = TransactionType.EXPENSE,
  initialDescription = '',
  editingTransaction = null,
}) => {
  const isEditing = Boolean(editingTransaction);
  const [description, setDescription] = useState(initialDescription);
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.categoryId || '');
  const [type, setType] = useState<TransactionType>(initialType);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza estado inicial sempre que o modal abre ou editingTransaction muda
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (editingTransaction) {
        setType(editingTransaction.type);
        setDescription(editingTransaction.description);
        // Formatar valor em reais com vírgula para edição intuitiva
        const formattedAmount = (editingTransaction.amount / 100).toFixed(2).replace('.', ',');
        setAmountStr(formattedAmount);
        setDate(editingTransaction.date);
        setCategoryId(editingTransaction.categoryId || categories[0]?.categoryId || '');
      } else {
        setType(initialType);
        setDescription(initialDescription || (initialType === TransactionType.INCOME ? 'Salário' : ''));
        setAmountStr('');
        setDate(defaultDate || new Date().toISOString().split('T')[0]);
        setCategoryId(categories[0]?.categoryId || '');
      }
    }
  }, [isOpen, editingTransaction, initialType, initialDescription, defaultDate, categories]);

  if (!isOpen) return null;

  const isIncome = type === TransactionType.INCOME;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError(isIncome ? 'Informe a descrição da renda' : 'Informe o descritivo da despesa');
      return;
    }

    const parsedNum = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(parsedNum) || parsedNum <= 0) {
      setError('Informe um valor válido maior que zero');
      return;
    }

    try {
      setLoading(true);
      const amount = Math.round(parsedNum * 100);
      await onSave({
        description: description.trim(),
        amount,
        date,
        categoryId: isIncome ? null : (categoryId || null),
        type,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTransaction || !onDelete) return;
    if (!window.confirm(`Deseja realmente excluir "${editingTransaction.description}"?`)) return;

    try {
      setDeleting(true);
      await onDelete(editingTransaction.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir transação');
    } finally {
      setDeleting(false);
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
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${
            isIncome
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
          }`}>
            {isEditing ? (
              <Pencil className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isEditing
                ? 'Editar Lançamento'
                : isIncome
                ? 'Lançar Renda / Receita'
                : 'Novo Gasto'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isEditing
                ? 'Atualize os dados ou valor da transação'
                : isIncome
                ? 'Salário, prestação de serviços ou entradas'
                : 'Despesa manual no teto orçamentário'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Seletor Tipo (Despesa / Renda) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType(TransactionType.EXPENSE);
                if (description === 'Salário') setDescription('');
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${
                !isIncome
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => {
                setType(TransactionType.INCOME);
                if (!description) setDescription('Salário');
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition ${
                isIncome
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Renda / Receita
            </button>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              {isIncome ? 'Origem / Descrição da Renda' : 'Descrição da Despesa'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isIncome ? 'Ex: Salário, Pró-labore, Freelance...' : 'Ex: Aluguel, Supermercado...'}
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              autoFocus
            />
          </div>

          {/* Valor */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Valor (R$)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl py-2 pl-9 pr-3 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Categoria */}
          {type === TransactionType.EXPENSE && (
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Categoria & Teto
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-amber-500 transition appearance-none"
                >
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name} ({c.targetPct}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Data */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Data
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-neutral-800">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || loading}
                className="px-3.5 py-2.5 rounded-xl border border-rose-800/80 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 transition flex items-center justify-center shrink-0 disabled:opacity-50"
                title="Excluir lançamento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={loading || deleting}
              className="flex-1 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || deleting}
              className={`flex-1 py-2.5 rounded-xl text-neutral-950 text-sm font-bold shadow-lg transition disabled:opacity-50 ${
                isIncome
                  ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
              }`}
            >
              {loading
                ? 'Salvando...'
                : deleting
                ? 'Excluindo...'
                : isEditing
                ? 'Salvar Alterações'
                : isIncome
                ? 'Lançar Renda'
                : 'Adicionar Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
