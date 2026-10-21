export interface InstallmentDetectionResult {
  isInstallment: boolean;
  currentInstallment?: number;
  totalInstallments?: number;
  cleanedDescription: string;
}

/**
 * Detecta se o descritivo de uma transação contém indicação de parcelamento.
 * Padrões suportados:
 * - "Compra Loja (02/05)" ou "[2/10]"
 * - "Loja X - Parcela 2 de 5" ou "Parcela 03/12"
 * - "Mercado Livre 2/6"
 */
export function detectInstallments(description: string): InstallmentDetectionResult {
  const trimmed = description.trim();

  // 1. Padrão explícito: "Parcela X de N" ou "(X de N)" ou "X de N"
  const parcelaDeRegex = /(?:\(|\b)parcela\s*(\d{1,2})\s*de\s*(\d{1,2})(?:\)|\b)/i;
  let match = trimmed.match(parcelaDeRegex);

  if (match) {
    const current = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);
    if (isValidInstallment(current, total)) {
      return {
        isInstallment: true,
        currentInstallment: current,
        totalInstallments: total,
        cleanedDescription: trimmed.replace(match[0], '').replace(/\s{2,}/g, ' ').trim(),
      };
    }
  }

  // 2. Padrão entre parênteses ou colchetes: "(02/05)", "[2/10]", "(2 de 5)"
  const bracketRegex = /[\(\[]\s*(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})\s*[\)\]]/i;
  match = trimmed.match(bracketRegex);

  if (match) {
    const current = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);
    if (isValidInstallment(current, total)) {
      return {
        isInstallment: true,
        currentInstallment: current,
        totalInstallments: total,
        cleanedDescription: trimmed.replace(match[0], '').replace(/\s{2,}/g, ' ').trim(),
      };
    }
  }

  // 3. Padrão isolado no fim da string ou delimitado: "Título 02/05" (evitando datas como 10/12/2026)
  // Ignora se for parte de uma data DD/MM/YYYY
  const isolatedSlashRegex = /(?<!\d\/)\b(\d{1,2})\/(\d{1,2})\b(?!\/\d{2,4})/;
  match = trimmed.match(isolatedSlashRegex);

  if (match) {
    const current = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);
    // Parcelamentos raramente excedem 72x
    if (isValidInstallment(current, total) && total <= 72) {
      return {
        isInstallment: true,
        currentInstallment: current,
        totalInstallments: total,
        cleanedDescription: trimmed.replace(match[0], '').replace(/\s{2,}/g, ' ').trim(),
      };
    }
  }

  return {
    isInstallment: false,
    cleanedDescription: trimmed,
  };
}

function isValidInstallment(current: number, total: number): boolean {
  return current > 0 && total >= current && total <= 99;
}
