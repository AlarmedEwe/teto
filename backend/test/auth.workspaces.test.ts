import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { WorkspacesService } from '../src/modules/workspaces/workspaces.service.js';
import { prisma } from '../src/shared/database/prisma.js';
import { WorkspaceType } from '@teto/types';

describe('Auth & Workspaces End-to-End Tests', () => {
  const authService = new AuthService();
  const workspacesService = new WorkspacesService();

  const testEmail = `test_${Date.now()}@teto.local`;
  let userId = '';
  let workspaceId = '';

  after(async () => {
    // Limpeza dos dados de teste
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
  });

  test('1. Deve registrar novo usuário com Argon2id e criar espaço com categorias', async () => {
    const res = await authService.register({
      name: 'Tester Argon2id',
      email: testEmail,
      password: 'minhaSenhaSegura123!',
    });

    assert.ok(res.user.id);
    assert.strictEqual(res.user.email, testEmail);
    assert.ok(res.user.activeWorkspaceId);

    userId = res.user.id;
    workspaceId = res.user.activeWorkspaceId!;

    // Verificar hash no banco
    const userDb = await prisma.user.findUnique({ where: { id: userId } });
    assert.ok(userDb?.passwordHash?.startsWith('$argon2id$v=19$m=65536,p=4,t=3$'));

    // Verificar se as 6 categorias padrão foram criadas para o espaço
    const categories = await prisma.category.findMany({
      where: { workspaceId },
    });
    assert.strictEqual(categories.length, 6);
  });

  test('2. Deve autenticar usuário com senha correta e rejeitar senha incorreta', async () => {
    // Senha errada
    await assert.rejects(
      async () => {
        await authService.login({ email: testEmail, password: 'senhaErrada' });
      },
      /E-mail ou senha incorretos/
    );

    // Senha correta
    const loginRes = await authService.login({
      email: testEmail,
      password: 'minhaSenhaSegura123!',
    });

    assert.strictEqual(loginRes.user.email, testEmail);
    assert.strictEqual(loginRes.user.id, userId);
  });

  test('3. Deve criar um segundo espaço do tipo CUMULATIVE (Reserva de Oportunidade)', async () => {
    const reserveWs = await workspacesService.createWorkspace(userId, {
      name: 'Reserva de Oportunidade',
      type: WorkspaceType.CUMULATIVE,
    });

    assert.ok(reserveWs.id);
    assert.strictEqual(reserveWs.name, 'Reserva de Oportunidade');
    assert.strictEqual(reserveWs.type, WorkspaceType.CUMULATIVE);

    // Listar espaços do usuário
    const list = await workspacesService.listUserWorkspaces(userId);
    assert.strictEqual(list.workspaces.length, 2);
  });

  test('4. Deve gerar convite e permitir que outro usuário seja adicionado ao espaço', async () => {
    const inviteEmail = `invited_${Date.now()}@teto.local`;
    const invite = await workspacesService.inviteMember(userId, workspaceId, inviteEmail);

    assert.ok(invite.token);
    assert.strictEqual(invite.email, inviteEmail);
    assert.strictEqual(invite.status, 'PENDING');

    // Registrar o convidado e aceitar convite
    const invitedUser = await authService.register({
      name: 'Convidado Familiar',
      email: inviteEmail,
      password: 'senhaConvidado123!',
    });

    // O registro automático aceita convites pendentes para o mesmo e-mail
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: invitedUser.user.id },
    });

    // Deve estar no espaço compartilhado
    const isInSharedWs = memberships.some((m) => m.workspaceId === workspaceId);
    assert.ok(isInSharedWs);

    // Limpar usuário convidado
    await prisma.user.delete({ where: { id: invitedUser.user.id } }).catch(() => {});
  });
});
