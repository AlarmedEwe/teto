import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectInstallments } from '../src/modules/transactions/installment-detector.js';

describe('Installment Detector Tests', () => {
  it('deve detectar parcelamento entre parênteses "(02/05)"', () => {
    const result = detectInstallments('Mercado Livre (02/05)');
    assert.equal(result.isInstallment, true);
    assert.equal(result.currentInstallment, 2);
    assert.equal(result.totalInstallments, 5);
    assert.equal(result.cleanedDescription, 'Mercado Livre');
  });

  it('deve detectar parcelamento com colchetes "[2/10]"', () => {
    const result = detectInstallments('Magazine Luiza [2/10]');
    assert.equal(result.isInstallment, true);
    assert.equal(result.currentInstallment, 2);
    assert.equal(result.totalInstallments, 10);
    assert.equal(result.cleanedDescription, 'Magazine Luiza');
  });

  it('deve detectar padrão textual "Parcela 3 de 12"', () => {
    const result = detectInstallments('Amazon - Parcela 3 de 12');
    assert.equal(result.isInstallment, true);
    assert.equal(result.currentInstallment, 3);
    assert.equal(result.totalInstallments, 12);
    assert.equal(result.cleanedDescription, 'Amazon -');
  });

  it('deve detectar padrão sem parênteses no final "Fast Shop 01/10"', () => {
    const result = detectInstallments('Fast Shop 01/10');
    assert.equal(result.isInstallment, true);
    assert.equal(result.currentInstallment, 1);
    assert.equal(result.totalInstallments, 10);
    assert.equal(result.cleanedDescription, 'Fast Shop');
  });

  it('NÃO deve detectar uma data como parcelamento (ex: "Compra 15/10/2026")', () => {
    const result = detectInstallments('Compra 15/10/2026');
    assert.equal(result.isInstallment, false);
    assert.equal(result.cleanedDescription, 'Compra 15/10/2026');
  });

  it('NÃO deve detectar parcelas inválidas onde X > N (ex: "5/2")', () => {
    const result = detectInstallments('Loja 05/02');
    assert.equal(result.isInstallment, false);
  });

  it('deve retornar isInstallment: false para transações à vista', () => {
    const result = detectInstallments('Supermercado Extra');
    assert.equal(result.isInstallment, false);
    assert.equal(result.cleanedDescription, 'Supermercado Extra');
  });
});
