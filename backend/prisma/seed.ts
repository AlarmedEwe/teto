import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/security/argon2.js';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Custos Fixos', defaultPct: 30, colorHex: '#3b82f6', icon: 'house' },
  { name: 'Conforto', defaultPct: 10, colorHex: '#06b6d4', icon: 'car' },
  { name: 'Metas', defaultPct: 20, colorHex: '#f59e0b', icon: 'bullseye' },
  { name: 'Prazeres', defaultPct: 10, colorHex: '#ec4899', icon: 'wine-glass' },
  { name: 'Investimentos', defaultPct: 25, colorHex: '#10b981', icon: 'dollar-sign' },
  { name: 'Conhecimento', defaultPct: 5, colorHex: '#8b5cf6', icon: 'graduation-cap' },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados Teto...');

  const defaultPasswordHash = await hashPassword('senha123');

  // Criar ou obter usuário padrão
  const user = await prisma.user.upsert({
    where: { email: 'default@teto.local' },
    update: {
      passwordHash: defaultPasswordHash,
    },
    create: {
      name: 'Usuário Padrão',
      email: 'default@teto.local',
      passwordHash: defaultPasswordHash,
    },
  });

  console.log(`👤 Usuário configurado: ${user.name} (${user.id})`);

  // Criar ou obter espaço padrão do usuário
  let workspace = await prisma.workspace.findFirst({
    where: {
      ownerId: user.id,
      name: 'Orçamento Pessoal',
    },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Orçamento Pessoal',
        type: 'BUDGET',
        ownerId: user.id,
      },
    });
    console.log(`🏠 Espaço padrão criado: ${workspace.name} (${workspace.id})`);
  }

  // Garantir adesão como OWNER
  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: { role: 'OWNER' },
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  // Cadastrar ou atualizar categorias padrão vinculadas ao espaço
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: cat.name,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          name: cat.name,
          defaultPct: cat.defaultPct,
          colorHex: cat.colorHex,
          icon: cat.icon,
        },
      });
      console.log(`  ➕ Categoria criada: ${cat.name} (${cat.defaultPct}%) com ícone ${cat.icon}`);
    } else {
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          workspaceId: workspace.id,
          icon: cat.icon,
        },
      });
      console.log(`  ✓ Categoria atualizada: ${cat.name} no espaço ${workspace.name}`);
    }
  }

  // Vincular orçamentos e transações antigas ao espaço padrão
  const budgetsUpdated = await prisma.monthlyBudget.updateMany({
    where: { userId: user.id, workspaceId: null },
    data: { workspaceId: workspace.id },
  });
  if (budgetsUpdated.count > 0) {
    console.log(`  ✓ ${budgetsUpdated.count} orçamentos vinculados ao espaço padrão`);
  }

  const txsUpdated = await prisma.transaction.updateMany({
    where: { userId: user.id, workspaceId: null },
    data: { workspaceId: workspace.id },
  });
  if (txsUpdated.count > 0) {
    console.log(`  ✓ ${txsUpdated.count} transações vinculadas ao espaço padrão`);
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
