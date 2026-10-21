export function formatCurrency(cents: number): string {
  const value = (cents || 0) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateIso: string): string {
  if (!dateIso) return '';
  const [year, month, day] = dateIso.split('-');
  return `${day}/${month}/${year}`;
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function getMonthName(monthNumber: number): string {
  return MONTH_NAMES[monthNumber - 1] || '';
}
