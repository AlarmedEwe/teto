import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, UserPlus, Check, Sparkles, Building2, Wallet } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCoins } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext.js';
import { WorkspaceType } from '@teto/types';

interface WorkspaceSwitcherProps {
  onOpenCreateWorkspace: () => void;
  onOpenInviteMember: () => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  onOpenCreateWorkspace,
  onOpenInviteMember,
}) => {
  const { user, workspaces, activeWorkspace, switchWorkspace, setIsAuthModalOpen } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition flex items-center gap-1.5"
      >
        <span>Entrar / Cadastrar</span>
      </button>
    );
  }

  const isCumulative = activeWorkspace?.type === WorkspaceType.CUMULATIVE;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 transition text-left group"
      >
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
            isCumulative
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}
        >
          <FontAwesomeIcon icon={isCumulative ? faCoins : faHouse} className="text-[10px]" />
        </div>

        <div className="min-w-0 max-w-[130px] sm:max-w-[160px]">
          <span className="text-xs font-bold text-white block truncate leading-tight">
            {activeWorkspace?.name || 'Carregando...'}
          </span>
          <span className="text-[10px] text-neutral-400 block truncate font-medium">
            {isCumulative ? 'Reserva Acumulada' : 'Orçamento com Tetos'}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-64 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
          <div className="px-2.5 py-1.5 border-b border-neutral-800/80 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
              Meus Espaços & Contas
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
            {workspaces.map((ws) => {
              const isCurrent = ws.id === activeWorkspace?.id;
              const isCum = ws.type === WorkspaceType.CUMULATIVE;

              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl flex items-center justify-between gap-2 text-left transition ${
                    isCurrent
                      ? 'bg-neutral-800 border border-neutral-700/80'
                      : 'hover:bg-neutral-800/50 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                        isCum
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      <FontAwesomeIcon icon={isCum ? faCoins : faHouse} className="text-[10px]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-white block truncate leading-tight">
                        {ws.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {isCum ? 'Reserva' : 'Orçamento'} • {ws.role === 'OWNER' ? 'Dono' : 'Membro'}
                      </span>
                    </div>
                  </div>

                  {isCurrent && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Ações Rápidas */}
          <div className="pt-1.5 border-t border-neutral-800/80 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCreateWorkspace();
              }}
              className="w-full px-2.5 py-1.5 rounded-xl hover:bg-neutral-800 transition flex items-center gap-2 text-xs font-medium text-neutral-200"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Criar Novo Espaço</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenInviteMember();
              }}
              className="w-full px-2.5 py-1.5 rounded-xl hover:bg-neutral-800 transition flex items-center gap-2 text-xs font-medium text-neutral-200"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-400" />
              <span>Convidar Membro</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
