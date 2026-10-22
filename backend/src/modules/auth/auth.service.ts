import { prisma } from '../../shared/database/prisma.js';
import { hashPassword, verifyPassword } from '../../shared/security/argon2.js';
import { RegisterDTO, LoginDTO, AuthResponseDTO } from '@teto/types';

const DEFAULT_CATEGORIES = [
  { name: 'Custos Fixos', defaultPct: 30, colorHex: '#3b82f6', icon: 'house' },
  { name: 'Conforto', defaultPct: 10, colorHex: '#06b6d4', icon: 'car' },
  { name: 'Metas', defaultPct: 20, colorHex: '#f59e0b', icon: 'bullseye' },
  { name: 'Prazeres', defaultPct: 10, colorHex: '#ec4899', icon: 'wine-glass' },
  { name: 'Investimentos', defaultPct: 25, colorHex: '#10b981', icon: 'dollar-sign' },
  { name: 'Conhecimento', defaultPct: 5, colorHex: '#8b5cf6', icon: 'graduation-cap' },
];

export class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    const email = data.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }

    // Hash com Argon2id seguindo RFC 9106
    const passwordHash = await hashPassword(data.password);

    // Criação transacional de Usuário + Espaço Inicial + Categorias Padrão
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name.trim(),
          email,
          passwordHash,
        },
      });

      // 1. Criar Espaço Padrão "Orçamento Pessoal"
      const workspace = await tx.workspace.create({
        data: {
          name: 'Orçamento Pessoal',
          type: 'BUDGET',
          ownerId: user.id,
        },
      });

      // 2. Vincular Usuário como OWNER
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      // 3. Cadastrar as 6 categorias padrão com FontAwesome pré-configurado
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((c) => ({
          userId: user.id,
          workspaceId: workspace.id,
          name: c.name,
          defaultPct: c.defaultPct,
          colorHex: c.colorHex,
          icon: c.icon,
        })),
      });

      // 4. Checar se existem convites pendentes para esse e-mail e aceitar automaticamente
      const pendingInvites = await tx.workspaceInvite.findMany({
        where: {
          email,
          status: 'PENDING',
          expiresAt: { gt: new Date() },
        },
      });

      for (const inv of pendingInvites) {
        await tx.workspaceMember.upsert({
          where: {
            workspaceId_userId: {
              workspaceId: inv.workspaceId,
              userId: user.id,
            },
          },
          update: {},
          create: {
            workspaceId: inv.workspaceId,
            userId: user.id,
            role: 'MEMBER',
          },
        });

        await tx.workspaceInvite.update({
          where: { id: inv.id },
          data: { status: 'ACCEPTED' },
        });
      }

      return { user, workspace };
    });

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        activeWorkspaceId: result.workspace.id,
      },
      message: 'Conta criada com sucesso!',
    };
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const email = data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const isValid = await verifyPassword(user.passwordHash, data.password);
    if (!isValid) {
      throw new Error('E-mail ou senha incorretos.');
    }

    // Seleciona o primeiro espaço ativo ou cria um se não existir
    let activeWorkspaceId = user.memberships[0]?.workspaceId;

    if (!activeWorkspaceId) {
      const newWs = await prisma.workspace.create({
        data: {
          name: 'Orçamento Pessoal',
          type: 'BUDGET',
          ownerId: user.id,
        },
      });

      await prisma.workspaceMember.create({
        data: {
          workspaceId: newWs.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      activeWorkspaceId = newWs.id;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        activeWorkspaceId,
      },
      message: 'Login realizado com sucesso!',
    };
  }

  async getMe(userId: string): Promise<AuthResponseDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const activeWorkspaceId = user.memberships[0]?.workspaceId;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        activeWorkspaceId,
      },
    };
  }
}
