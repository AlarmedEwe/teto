import { PrismaClient } from '@prisma/client';

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

  // Criar ou obter usuário padrão
  const user = await prisma.user.upsert({
    where: { email: 'default@teto.local' },
    update: {},
    create: {
      name: 'Usuário Padrão',
      email: 'default@teto.local',
    },
  });

  console.log(`👤 Usuário configurado: ${user.name} (${user.id})`);

  // Cadastrar ou atualizar categorias padrão com seus ícones
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
          icon: cat.icon,
        },
      });
      console.log(`  ✓ Categoria atualizada com ícone: ${cat.name} -> ${cat.icon}`);
    }
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
