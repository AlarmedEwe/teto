import { detectInstallments } from './installment-detector.js';

export interface ParsedCsvRow {
  date: string; // ISO YYYY-MM-DD
  description: string;
  amount: number; // centavos inteiros (sempre positivo para EXPENSE)
  categoryName?: string;
  installmentInfo?: {
    current: number;
    total: number;
  };
}

/**
 * Detecta o delimitador principal do CSV (vírgula, ponto-e-vírgula ou tab).
 */
export function detectDelimiter(headerLine: string): string {
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;
  const tabCount = (headerLine.match(/\t/g) || []).length;

  if (semiCount > commaCount && semiCount > tabCount) return ';';
  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  return ',';
}

/**
 * Normaliza valores monetários brasileiros e internacionais para centavos inteiros.
 * Suporta: "150.50", "150,50", "-1.250,90", "R$ 35,00", etc.
 */
export function parseAmountToCents(raw: string): number {
  if (!raw) return 0;

  // Remover símbolo monetário e espaços
  let cleaned = raw.replace(/[R$\s]/gi, '').trim();

  // Se tiver tanto ponto quanto vírgula (ex: 1.250,50 ou 1,250.50)
  if (cleaned.includes('.') && cleaned.includes(',')) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      // Padrão brasileiro: 1.250,50 -> remove ponto, troca vírgula por ponto
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Padrão US: 1,250.50 -> remove vírgula
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    // Apenas vírgula: 150,50 -> 150.50
    cleaned = cleaned.replace(',', '.');
  }

  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;

  // Salva em centavos e preserva valor absoluto (gastos de fatura normalmente vêm negativos ou positivos)
  return Math.round(Math.abs(num) * 100);
}

/**
 * Normaliza datas para o formato ISO YYYY-MM-DD.
 * Suporta: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY.
 */
export function parseDateToISO(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  const trimmed = raw.trim();

  // ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // BR DD/MM/YYYY
  const brMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (brMatch) {
    const day = brMatch[1].padStart(2, '0');
    const month = brMatch[2].padStart(2, '0');
    const year = brMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Tenta parse nativo se for formato compreensível
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Faz o parsing de linhas respeitando aspas que contenham delimitadores.
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map((col) => col.replace(/^"(.*)"$/, '$1').trim());
}

/**
 * Executa o parse completo do conteúdo CSV retornando registros normalizados.
 */
export function parseTransactionsCsv(content: string): ParsedCsvRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map((h) => h.toLowerCase());

  // Mapear colunas pelo cabeçalho
  let dateIdx = headers.findIndex((h) => /data|date/i.test(h));
  let descIdx = headers.findIndex((h) => /descri|hist|título|title/i.test(h));
  let amountIdx = headers.findIndex((h) => /valor|amount|preço|price/i.test(h));
  let catIdx = headers.findIndex((h) => /cat/i.test(h));

  // Fallbacks comuns caso cabeçalhos não batam perfeitamente
  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = headers.length > 1 ? 1 : 0;
  if (amountIdx === -1) amountIdx = headers.length > 2 ? 2 : 1;

  const rows: ParsedCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], delimiter);
    if (cols.length <= Math.max(dateIdx, descIdx, amountIdx)) continue;

    const rawDate = cols[dateIdx];
    const rawDesc = cols[descIdx];
    const rawAmount = cols[amountIdx];
    const rawCat = catIdx !== -1 && cols[catIdx] ? cols[catIdx] : undefined;

    const amount = parseAmountToCents(rawAmount);
    if (amount === 0) continue; // Pular transações zeradas

    const date = parseDateToISO(rawDate);
    const installmentResult = detectInstallments(rawDesc);

    rows.push({
      date,
      description: rawDesc,
      amount,
      categoryName: rawCat,
      installmentInfo: installmentResult.isInstallment ? {
        current: installmentResult.currentInstallment!,
        total: installmentResult.totalInstallments!,
      } : undefined,
    });
  }

  return rows;
}
