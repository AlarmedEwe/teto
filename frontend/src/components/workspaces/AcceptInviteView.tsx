import React, { useState, useEffect } from 'react';
import { Building2, Check, Lock, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { WorkspaceInviteResponseDTO } from '@teto/types';

interface AcceptInviteViewProps {
  token: string;
  onAccepted: () => void;
}

export const AcceptInviteView: React.FC<AcceptInviteViewProps> = ({ token, onAccepted }) => {
  const { user, refreshWorkspaces } = useAuth();
  const [invite, setInvite] = useState<WorkspaceInviteResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos para novo usuário
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function fetchInvite() {
      try {
        setLoading(true);
        const res = await api.workspaces.getInvite(token);
        setInvite(res);
      } catch (err: any) {
        setError(err.message || 'Convite inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    }
    fetchInvite();
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      await api.workspaces.acceptInvite({
        token,
        name: user ? undefined : name,
        password: user ? undefined : password,
      });

      await refreshWorkspaces();
      onAccepted();
      window.history.pushState({}, '', '/');
    } catch (err: any) {
      setError(err.message || 'Erro ao aceitar convite.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-neutral-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm">Verificando convite de compartilhamento...</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Convite Indisponível</h3>
        <p className="text-xs text-neutral-400">{error || 'Este convite não pôde ser encontrado.'}</p>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
        >
          Ir para a Página Inicial
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-7 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-5">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Você foi convidado!</h3>
        <p className="text-xs text-neutral-300">
          Você recebeu um convite para colaborar no espaço{' '}
          <strong className="text-amber-400">{invite.workspaceName}</strong>.
        </p>
      </div>

      <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between">
        <span className="text-neutral-400">E-mail convidado:</span>
        <strong className="text-white font-mono">{invite.email}</strong>
      </div>

      <form onSubmit={handleAccept} className="space-y-4">
        {!user ? (
          <>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Crie sua senha para entrar com criptografia <strong>Argon2id</strong>.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Seu Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome ou apelido"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Escolha uma Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Você está conectado como <strong>{user.email}</strong>.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirmando...</span>
            </>
          ) : (
            <>
              <span>{user ? 'Aceitar e Entrar no Espaço' : 'Criar Conta e Acessar'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
