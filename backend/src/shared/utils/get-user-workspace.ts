import { FastifyRequest } from 'fastify';
import { prisma } from '../database/prisma.js';
import { getDefaultUser } from './get-default-user.js';

export interface UserWorkspaceContext {
  userId: string;
  workspaceId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function getUserAndWorkspace(request: FastifyRequest): Promise<UserWorkspaceContext> {
  const userPayload = (request as any).user;

  if (!userPayload?.userId) {
    // Se não houver autenticação ativa, obtém o usuário e espaço padrão
    const defaultUser = await getDefaultUser();
    let ws = await prisma.workspace.findFirst({
      where: { ownerId: defaultUser.id },
    });

    if (!ws) {
      ws = await prisma.workspace.create({
        data: { name: 'Orçamento Pessoal', type: 'BUDGET', ownerId: defaultUser.id },
      });
      await prisma.workspaceMember.create({
        data: { workspaceId: ws.id, userId: defaultUser.id, role: 'OWNER' },
      });
    }

    return {
      userId: defaultUser.id,
      workspaceId: ws.id,
      user: defaultUser,
    };
  }

  // Usuário autenticado
  const user = await prisma.user.findUnique({
    where: { id: userPayload.userId },
  });

  if (!user) {
    throw new Error('Usuário autenticado não encontrado');
  }

  // Espaço solicitado pelo cliente via header x-workspace-id ou query workspaceId
  const requestedWorkspaceId =
    (request.headers['x-workspace-id'] as string) ||
    (request.query as any)?.workspaceId ||
    userPayload.activeWorkspaceId;

  if (requestedWorkspaceId) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: requestedWorkspaceId,
          userId: user.id,
        },
      },
    });

    if (member) {
      return {
        userId: user.id,
        workspaceId: requestedWorkspaceId,
        user,
      };
    }
  }

  // Fallback: primeiro espaço onde o usuário é membro
  const firstMembership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    orderBy: { joinedAt: 'asc' },
  });

  if (!firstMembership) {
    const ws = await prisma.workspace.create({
      data: { name: 'Orçamento Pessoal', type: 'BUDGET', ownerId: user.id },
    });
    await prisma.workspaceMember.create({
      data: { workspaceId: ws.id, userId: user.id, role: 'OWNER' },
    });
    return {
      userId: user.id,
      workspaceId: ws.id,
      user,
    };
  }

  return {
    userId: user.id,
    workspaceId: firstMembership.workspaceId,
    user,
  };
}
