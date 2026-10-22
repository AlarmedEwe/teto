import { prisma } from '../../shared/database/prisma.js';
import { CategoryListResponseDTO, UpdateCategoriesDTO } from '@teto/types';

export class CategoriesService {
  async listCategories(userId: string, workspaceId?: string): Promise<CategoryListResponseDTO> {
    const categories = await prisma.category.findMany({
      where: workspaceId ? { workspaceId } : { userId },
      orderBy: { defaultPct: 'desc' },
    });

    return {
      categories: categories.map((c) => ({
        id: c.id,
        userId: c.userId,
        workspaceId: c.workspaceId || '',
        name: c.name,
        defaultPct: c.defaultPct,
        colorHex: c.colorHex,
        icon: c.icon || null,
      })),
    };
  }

  async updateCategories(userId: string, data: UpdateCategoriesDTO, workspaceId?: string): Promise<CategoryListResponseDTO> {
    if (!data.categories || !Array.isArray(data.categories)) {
      throw new Error('Lista de categorias inválida');
    }

    // Validar percentuais
    let totalPct = 0;
    for (const item of data.categories) {
      if (typeof item.defaultPct !== 'number' || item.defaultPct < 0) {
        throw new Error(`Percentual inválido para a categoria ${item.id}`);
      }
      totalPct += item.defaultPct;
    }

    if (totalPct > 100) {
      throw new Error(`A soma das metas percentuais (${totalPct}%) não pode exceder 100%`);
    }

    // Atualizar no banco
    await prisma.$transaction(
      data.categories.map((cat) =>
        prisma.category.updateMany({
          where: {
            id: cat.id,
            ...(workspaceId ? { workspaceId } : { userId }),
          },
          data: {
            defaultPct: cat.defaultPct,
            ...(cat.colorHex ? { colorHex: cat.colorHex } : {}),
            ...(cat.icon !== undefined ? { icon: cat.icon } : {}),
          },
        })
      )
    );

    return this.listCategories(userId, workspaceId);
  }
}
