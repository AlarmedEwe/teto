import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      if (tab === 'login') {
        await login({ email: email.trim(), password });
      } else {
        if (!name.trim()) {
          setError('Informe seu nome completo.');
          setLoading(false);
          return;
        }
        await register({ name: name.trim(), email: email.trim(), password });
      }
    } catch (err: any) {
      setError(err.message || 'Erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header com Fechar */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {tab === 'login' ? 'Acessar o Teto' : 'Criar sua Conta'}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badge de Segurança Argon2id RFC 9106 */}
        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="leading-tight">
            Criptografia de ponta <strong>Argon2id (RFC 9106)</strong> com cookies HttpOnly.
          </span>
        </div>

        {/* Tabs de alternância */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-2 rounded-xl transition ${
              tab === 'login'
                ? 'bg-neutral-800 text-white shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-2 rounded-xl transition ${
              tab === 'register'
                ? 'bg-neutral-800 text-white shadow-sm font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome ou apelido"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Senha
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <span>{tab === 'login' ? 'Entrar no Sistema' : 'Finalizar Cadastro'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
