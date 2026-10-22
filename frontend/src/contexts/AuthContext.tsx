import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUserDTO,
  LoginDTO,
  RegisterDTO,
  WorkspaceResponseDTO,
  WorkspaceType,
} from '@teto/types';
import { api, setActiveWorkspaceId, getActiveWorkspaceId } from '../services/api.js';

interface AuthContextType {
  user: AuthUserDTO | null;
  workspaces: WorkspaceResponseDTO[];
  activeWorkspace: WorkspaceResponseDTO | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserDTO | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceResponseDTO[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadWorkspaces = useCallback(async () => {
    try {
      const res = await api.workspaces.list();
      setWorkspaces(res.workspaces);

      const currentActiveId = getActiveWorkspaceId();
      let matched = res.workspaces.find((w) => w.id === currentActiveId);

      if (!matched && res.workspaces.length > 0) {
        matched = res.workspaces[0];
        setActiveWorkspaceId(matched.id);
      }

      setActiveWorkspace(matched || null);
    } catch (err) {
      console.error('Erro ao listar espaços do usuário:', err);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.auth.me();
      setUser(res.user);
      await loadWorkspaces();
    } catch {
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, [loadWorkspaces]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (data: LoginDTO) => {
    const res = await api.auth.login(data);
    setUser(res.user);
    await loadWorkspaces();
    setIsAuthModalOpen(false);
  };

  const register = async (data: RegisterDTO) => {
    const res = await api.auth.register(data);
    setUser(res.user);
    await loadWorkspaces();
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
  };

  const switchWorkspace = (workspaceId: string) => {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (target) {
      setActiveWorkspaceId(target.id);
      setActiveWorkspace(target);
      // Dispara reload suave das informações orçamentárias
      window.dispatchEvent(new CustomEvent('workspace-switched', { detail: { workspaceId: target.id } }));
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        logout,
        switchWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
