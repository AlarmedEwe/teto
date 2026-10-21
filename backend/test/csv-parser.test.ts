import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectDelimiter,
  parseAmountToCents,
  parseDateToISO,
  parseTransactionsCsv,
} from '../src/modules/transactions/csv-parser.js';

describe('CSV Parser Tests', () => {
  describe('detectDelimiter', () => {
    it('deve detectar vírgula como delimitador', () => {
      assert.equal(detectDelimiter('date,category,title,amount'), ',');
    });

    it('deve detectar ponto e vírgula como delimitador', () => {
      assert.equal(detectDelimiter('Data;Histórico;Valor;Categoria'), ';');
    });
  });

  describe('parseAmountToCents', () => {
    it('deve converter valor decimal com ponto ("150.50") para 15050 centavos', () => {
      assert.equal(parseAmountToCents('150.50'), 15050);
    });

    it('deve converter valor brasileiro com vírgula ("150,50") para 15050 centavos', () => {
      assert.equal(parseAmountToCents('150,50'), 15050);
    });

    it('deve converter valor com milhar e vírgula ("1.250,90") para 125090 centavos', () => {
      assert.equal(parseAmountToCents('1.250,90'), 125090);
    });

    it('deve converter valor negativo de extrato ("-45,90") para 4590 centavos', () => {
      assert.equal(parseAmountToCents('-45,90'), 4590);
    });

    it('deve ignorar prefixo monetário "R$ 99,90"', () => {
      assert.equal(parseAmountToCents('R$ 99,90'), 9990);
    });
  });

  describe('parseDateToISO', () => {
    it('deve preservar datas já em formato ISO YYYY-MM-DD', () => {
      assert.equal(parseDateToISO('2026-10-15'), '2026-10-15');
    });

    it('deve converter data no padrão brasileiro DD/MM/YYYY para YYYY-MM-DD', () => {
      assert.equal(parseDateToISO('15/10/2026'), '2026-10-15');
      assert.equal(parseDateToISO('05/02/2026'), '2026-02-05');
    });
  });

  describe('parseTransactionsCsv (Full parsing)', () => {
    it('deve processar CSV padrão Nubank (vírgula e ponto)', () => {
      const csv = `date,category,title,amount
2026-10-10,alimentação,Supermercado Extra,185.40
2026-10-12,transporte,Uber *Trip,24.90
2026-10-14,eletrônicos,Notebook Dell (02/10),450.00`;

      const rows = parseTransactionsCsv(csv);
      assert.equal(rows.length, 3);

      assert.equal(rows[0].description, 'Supermercado Extra');
      assert.equal(rows[0].amount, 18540);
      assert.equal(rows[0].date, '2026-10-10');
      assert.equal(rows[0].installmentInfo, undefined);

      assert.equal(rows[2].description, 'Notebook Dell (02/10)');
      assert.equal(rows[2].amount, 45000);
      assert.deepEqual(rows[2].installmentInfo, { current: 2, total: 10 });
    });

    it('deve processar CSV padrão Inter/Itaú (ponto e vírgula e vírgula decimal)', () => {
      const csv = `Data;Histórico;Valor
15/10/2026;Restaurante Outback;-220,50
18/10/2026;Magazine Luiza Parcela 2 de 5;-150,00`;

      const rows = parseTransactionsCsv(csv);
      assert.equal(rows.length, 2);

      assert.equal(rows[0].date, '2026-10-15');
      assert.equal(rows[0].amount, 22050);

      assert.equal(rows[1].date, '2026-10-18');
      assert.equal(rows[1].amount, 15000);
      assert.deepEqual(rows[1].installmentInfo, { current: 2, total: 5 });
    });
  });
});
