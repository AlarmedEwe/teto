/**
 * Funções matemáticas puras para o cálculo do teto orçamentário e percentuais de consumo.
 * Todas as operações operam estritamente com valores inteiros em centavos.
 */

/**
 * Calcula o teto da categoria em centavos a partir da renda do mês e da meta percentual.
 * Teto = Math.round(incomeInCents * (targetPct / 100))
 */
export function calculateCeiling(incomeInCents: number, targetPct: number): number {
  if (incomeInCents <= 0 || targetPct <= 0) return 0;
  return Math.round((incomeInCents * targetPct) / 100);
}

/**
 * Calcula o percentual utilizado do teto com 1 casa decimal.
 * Utilizado (%) = ceilingInCents > 0 ? (spentInCents / ceilingInCents) * 100 : 0
 */
export function calculateUsedPct(spentInCents: number, ceilingInCents: number): number {
  if (ceilingInCents <= 0 || spentInCents <= 0) return 0;
  const pct = (spentInCents / ceilingInCents) * 100;
  return Number(pct.toFixed(1));
}

/**
 * Calcula o percentual do gasto da categoria em relação ao total de despesas do mês.
 * Total Real (%) = totalSpentInCents > 0 ? (spentInCents / totalSpentInCents) * 100 : 0
 */
export function calculateTotalRealPct(spentInCents: number, totalSpentInCents: number): number {
  if (totalSpentInCents <= 0 || spentInCents <= 0) return 0;
  const pct = (spentInCents / totalSpentInCents) * 100;
  return Number(pct.toFixed(1));
}

/**
 * Calcula o saldo disponível no mês (Renda - Total de Despesas).
 */
export function calculateBalance(incomeInCents: number, totalSpentInCents: number): number {
  return incomeInCents - totalSpentInCents;
}
