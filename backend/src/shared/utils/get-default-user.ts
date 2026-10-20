import { prisma } from '../database/prisma.js';

export async function getDefaultUser() {
  return await prisma.user.upsert({
    where: { email: 'default@teto.local' },
    update: {},
    create: {
      name: 'Usuário Padrão',
      email: 'default@teto.local',
    },
  });
}
