import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCeiling,
  calculateUsedPct,
  calculateTotalRealPct,
  calculateBalance,
} from '../src/modules/budget/budget.calculator.js';

describe('Budget Calculator Tests', () => {
  describe('calculateCeiling', () => {
    it('deve calcular o teto exato para R$ 10.000,00 com meta de 30% (Custos Fixos)', () => {
      const income = 1000000; // R$ 10.000,00 em centavos
      const targetPct = 30;
      const ceiling = calculateCeiling(income, targetPct);
      assert.equal(ceiling, 300000); // R$ 3.000,00
    });

    it('deve calcular o teto com arredondamento correto para valores quebrados', () => {
      const income = 543210; // R$ 5.432,10
      const targetPct = 25; // Investimento
      const ceiling = calculateCeiling(income, targetPct);
      assert.equal(ceiling, 135803); // Math.round(543210 * 0.25) = 135803
    });

    it('deve retornar 0 quando a renda ou percentual forem zero ou negativos', () => {
      assert.equal(calculateCeiling(0, 30), 0);
      assert.equal(calculateCeiling(-1000, 30), 0);
      assert.equal(calculateCeiling(100000, 0), 0);
    });
  });

  describe('calculateUsedPct', () => {
    it('deve calcular o percentual utilizado dentro do teto (ex: 83.3%)', () => {
      const spent = 250000;   // R$ 2.500,00
      const ceiling = 300000; // R$ 3.000,00
      const usedPct = calculateUsedPct(spent, ceiling);
      assert.equal(usedPct, 83.3);
    });

    it('deve calcular corretamente estouro do teto (ex: > 100%)', () => {
      const spent = 350000;   // R$ 3.500,00
      const ceiling = 300000; // R$ 3.000,00
      const usedPct = calculateUsedPct(spent, ceiling);
      assert.equal(usedPct, 116.7);
    });

    it('não deve dividir por zero quando o teto for 0', () => {
      const spent = 15000;
      const ceiling = 0;
      assert.equal(calculateUsedPct(spent, ceiling), 0);
    });
  });

  describe('calculateTotalRealPct', () => {
    it('deve calcular a fatia da categoria em relação ao total gasto no mês', () => {
      const spent = 250000;      // R$ 2.500,00
      const totalSpent = 420000; // R$ 4.200,00
      const realPct = calculateTotalRealPct(spent, totalSpent);
      assert.equal(realPct, 59.5);
    });

    it('não deve dividir por zero quando não houver gastos no mês', () => {
      assert.equal(calculateTotalRealPct(0, 0), 0);
      assert.equal(calculateTotalRealPct(1000, 0), 0);
    });
  });

  describe('calculateBalance', () => {
    it('deve calcular o saldo positivo restante', () => {
      const income = 1000000;
      const totalSpent = 420000;
      assert.equal(calculateBalance(income, totalSpent), 580000);
    });

    it('deve calcular saldo negativo quando houver déficit no mês', () => {
      const income = 500000;
      const totalSpent = 650000;
      assert.equal(calculateBalance(income, totalSpent), -150000);
    });
  });
});
