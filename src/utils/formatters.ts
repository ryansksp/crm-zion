// Formata valores monetários em Real
export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) return 'R$ 0,00';

  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

// Formata valores percentuais
export function formatPercent(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return '0%';

  const num =
    typeof value === 'string'
      ? parseFloat(value.toString().replace(',', '.'))
      : value;

  if (isNaN(Number(num))) return '0%';

  return `${Number(num).toFixed(2)}%`;
}

// Converte strings (com vírgula/ponto) para número
export function parseNumber(value?: string | number | null): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanValue = value.toString().replace(/[^\d,.-]/g, '');
  // Substitui vírgula por ponto
  const normalizedValue = cleanValue.replace(',', '.');

  return parseFloat(normalizedValue) || 0;
}

// Formata datas no padrão pt-BR
export function formatDate(date?: string | Date | null): string {
  if (!date) return '—';

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('pt-BR');
}
