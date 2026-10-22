import React, { useState } from 'react';
import { X, Building2, Coins, ArrowRight, Check } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCoins } from '@fortawesome/free-solid-svg-icons';
import { WorkspaceType } from '@teto/types';
import { api } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.js';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { refreshWorkspaces, switchWorkspace } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState<WorkspaceType>(WorkspaceType.BUDGET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe um nome para o espaço.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const ws = await api.workspaces.create({
        name: name.trim(),
        type,
      });

      await refreshWorkspaces();
      switchWorkspace(ws.id);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar espaço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-white">Criar Novo Espaço / Conta</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Nome do Espaço
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Orçamento Familiar, Reserva de Oportunidade..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Tipo de Espaço
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Opção 1: Orçamento com Tetos */}
              <button
                type="button"
                onClick={() => setType(WorkspaceType.BUDGET)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  type === WorkspaceType.BUDGET
                    ? 'bg-neutral-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                  <FontAwesomeIcon icon={faHouse} className="text-xs" />
                </div>
                <span className="text-xs font-bold text-white block">
                  Orçamento com Tetos
                </span>
                <span className="text-[11px] text-neutral-400 leading-tight block mt-0.5">
                  Tetos calculados por percentual da renda mensal e reset mensal.
                </span>
              </button>

              {/* Opção 2: Reserva de Oportunidade */}
              <button
                type="button"
                onClick={() => setType(WorkspaceType.CUMULATIVE)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  type === WorkspaceType.CUMULATIVE
                    ? 'bg-neutral-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                  <FontAwesomeIcon icon={faCoins} className="text-xs" />
                </div>
                <span className="text-xs font-bold text-white block">
                  Reserva Cumulativa
                </span>
                <span className="text-[11px] text-neutral-400 leading-tight block mt-0.5">
                  Saldo histórico contínuo para reservas guardadas e aportes.
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <span>{loading ? 'Criando...' : 'Criar Espaço'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
