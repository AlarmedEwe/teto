import argon2, { argon2id, HashOptions } from 'argon2';

/**
 * Parâmetros recomendados pela RFC 9106 (Seção 4) para Argon2id:
 * - memoryCost: 64 MiB (65536 KiB)
 * - timeCost: 3 iterações
 * - parallelism: 4 threads/lanes
 * - hashLength: 32 bytes (256 bits)
 * - salt: 16 bytes gerados automaticamente
 */
export const ARGON2_RFC9106_OPTIONS: HashOptions = {
  type: argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
};

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, ARGON2_RFC9106_OPTIONS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}
