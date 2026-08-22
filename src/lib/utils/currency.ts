const formatter = new Intl.NumberFormat('ar-YE', {
  style: 'decimal',
  maximumFractionDigits: 0,
});

export function formatPriceYER(price: string | number): string {
  const value = typeof price === 'string' ? parseFloat(price) : price;
  if (Number.isNaN(value)) return String(price);
  return `${formatter.format(value)} ر.ي`;
}
