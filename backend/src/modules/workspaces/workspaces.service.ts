import crypto from 'node:crypto';
import { prisma } from '../../shared/database/prisma.js';
import {
  CreateWorkspaceDTO,
  WorkspaceListResponseDTO,
  WorkspaceResponseDTO,
  WorkspaceInviteResponseDTO,
  WorkspaceMemberRole,
  WorkspaceType,
} from '@teto/types';

const BUDGET_DEFAULT_CATEGORIES = [
  { name: 'Custos Fixos', defaultPct: 30, colorHex: '#3b82f6', icon: 'house' },
  { name: 'Conforto', defaultPct: 10, colorHex: '#06b6d4', icon: 'car' },
  { name: 'Metas', defaultPct: 20, colorHex: '#f59e0b', icon: 'bullseye' },
  { name: 'Prazeres', defaultPct: 10, colorHex: '#ec4899', icon: 'wine-glass' },
  { name: 'Investimentos', defaultPct: 25, colorHex: '#10b981', icon: 'dollar-sign' },
  { name: 'Conhecimento', defaultPct: 5, colorHex: '#8b5cf6', icon: 'graduation-cap' },
];

const CUMULATIVE_DEFAULT_CATEGORIES = [
  { name: 'Aporte de Reserva', defaultPct: 50, colorHex: '#10b981', icon: 'dollar-sign' },
  { name: 'Oportunidade / Aquisições', defaultPct: 30, colorHex: '#f59e0b', icon: 'bullseye' },
  { name: 'Rendimentos & Dividendos', defaultPct: 20, colorHex: '#3b82f6', icon: 'house' },
];

export class WorkspacesService {
  async listUserWorkspaces(userId: string, activeWorkspaceId?: string): Promise<WorkspaceListResponseDTO> {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    const workspaces: WorkspaceResponseDTO[] = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      type: m.workspace.type as WorkspaceType,
      ownerId: m.workspace.ownerId,
      role: m.role as WorkspaceMemberRole,
      createdAt: m.workspace.createdAt,
    }));

    const resolvedActiveId = activeWorkspaceId && workspaces.some((w) => w.id === activeWorkspaceId)
      ? activeWorkspaceId
      : workspaces[0]?.id || '';

    return {
      workspaces,
      activeWorkspaceId: resolvedActiveId,
    };
  }

  async createWorkspace(userId: string, data: CreateWorkspaceDTO): Promise<WorkspaceResponseDTO> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Informe um nome para o espaço.');
    }

    const type = data.type || WorkspaceType.BUDGET;

    const workspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: {
          name: data.name.trim(),
          type,
          ownerId: userId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: ws.id,
          userId,
          role: 'OWNER',
        },
      });

      const categoriesToCreate = type === WorkspaceType.CUMULATIVE
        ? CUMULATIVE_DEFAULT_CATEGORIES
        : BUDGET_DEFAULT_CATEGORIES;

      await tx.category.createMany({
        data: categoriesToCreate.map((c) => ({
          userId,
          workspaceId: ws.id,
          name: c.name,
          defaultPct: c.defaultPct,
          colorHex: c.colorHex,
          icon: c.icon,
        })),
      });

      return ws;
    });

    return {
      id: workspace.id,
      name: workspace.name,
      type: workspace.type as WorkspaceType,
      ownerId: workspace.ownerId,
      role: WorkspaceMemberRole.OWNER,
      createdAt: workspace.createdAt,
    };
  }

  async inviteMember(userId: string, workspaceId: string, email: string): Promise<WorkspaceInviteResponseDTO> {
    const cleanEmail = email.trim().toLowerCase();

    // Validar se o usuário tem permissão no espaço
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      throw new Error('Você não tem acesso a este espaço.');
    }

    // Se já for membro, não precisa convidar
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      const alreadyMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: existingUser.id,
          },
        },
      });
      if (alreadyMember) {
        throw new Error('Este usuário já é membro deste espaço.');
      }
    }

    // Gerar token seguro
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId,
        senderId: userId,
        email: cleanEmail,
        token,
        status: 'PENDING',
        expiresAt,
      },
    });

    return {
      id: invite.id,
      workspaceId: invite.workspaceId,
      workspaceName: membership.workspace.name,
      email: invite.email,
      token: invite.token,
      status: invite.status as any,
      expiresAt: invite.expiresAt,
      inviteUrl: `/invite/${invite.token}`,
    };
  }

  async getInviteInfo(token: string): Promise<WorkspaceInviteResponseDTO> {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invite) {
      throw new Error('Convite inválido ou expirado.');
    }

    if (new Date() > invite.expiresAt || invite.status !== 'PENDING') {
      throw new Error('Este convite expirou ou já foi utilizado.');
    }

    return {
      id: invite.id,
      workspaceId: invite.workspaceId,
      workspaceName: invite.workspace.name,
      email: invite.email,
      token: invite.token,
      status: invite.status as any,
      expiresAt: invite.expiresAt,
      inviteUrl: `/invite/${invite.token}`,
    };
  }

  async acceptInvite(userId: string, token: string): Promise<{ workspaceId: string; workspaceName: string }> {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invite || invite.status !== 'PENDING' || new Date() > invite.expiresAt) {
      throw new Error('Convite inválido ou expirado.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.workspaceMember.upsert({
        where: {
          workspaceId_userId: {
            workspaceId: invite.workspaceId,
            userId,
          },
        },
        update: {},
        create: {
          workspaceId: invite.workspaceId,
          userId,
          role: 'MEMBER',
        },
      });

      await tx.workspaceInvite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
        },
      });
    });

    return {
      workspaceId: invite.workspaceId,
      workspaceName: invite.workspace.name,
    };
  }
}
