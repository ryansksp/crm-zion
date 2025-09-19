export function formatCurrency(value: number) {
  if (isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}
export function formatPercent(value: string | number) {
  if (value === undefined || value === null || value === "") return "0%";
  let num = typeof value === "string" ? parseFloat(value.toString().replace(",", ".")) : value;
  return `${num.toFixed(2)}%`;
}

export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanValue = value.toString().replace(/[^\d,.-]/g, '');
  // Substitui vírgula por ponto
  const normalizedValue = cleanValue.replace(',', '.');

  return parseFloat(normalizedValue) || 0;
}
