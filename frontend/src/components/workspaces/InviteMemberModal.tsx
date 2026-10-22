import React, { useState } from 'react';
import { X, UserPlus, Copy, Check, Mail, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';
import { WorkspaceInviteResponseDTO } from '@teto/types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { activeWorkspace } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<WorkspaceInviteResponseDTO | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activeWorkspace) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.workspaces.invite(activeWorkspace.id, { email: email.trim() });
      setInviteResult(res);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar convite.');
    } finally {
      setLoading(false);
    }
  };

  const inviteUrl = inviteResult
    ? `${window.location.origin}/invite/${inviteResult.token}`
    : '';

  const handleCopyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleClose = () => {
    setInviteResult(null);
    setEmail('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Convidar para {activeWorkspace.name}</h3>
          </div>
          <button
            onClick={handleClose}
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

        {!inviteResult ? (
          <form onSubmit={handleInvite} className="space-y-4">
            <p className="text-xs text-neutral-400 leading-relaxed">
              Convide seu parceiro(a) ou familiar para compartilhar a gestão deste espaço.
              Eles poderão visualizar e cadastrar gastos e orçamentos em conjunto.
            </p>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                E-mail do Convidado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                  autoFocus
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
              >
                <span>{loading ? 'Gerando...' : 'Gerar Convite'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Convite gerado para <strong>{inviteResult.email}</strong>!</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Link de Convite Compartilhável
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-3 text-neutral-300 text-xs font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    copied
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                O convite expira em 7 dias. O convidado pode criar a conta ou entrar se já tiver cadastro.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
