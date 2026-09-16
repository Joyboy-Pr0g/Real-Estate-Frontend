import type { YerVariant } from '@/features/listings/types/listing';

const formatter = new Intl.NumberFormat('ar-YE', {
  style: 'decimal',
  maximumFractionDigits: 0,
});

export function formatPriceYER(price: string | number, yerVariant?: YerVariant): string {
  const value = typeof price === 'string' ? parseFloat(price) : price;
  if (Number.isNaN(value)) return String(price);
  const amount = `${formatter.format(value)} ر.ي`;
  if (yerVariant === 'جديد') return `${amount} (جديد)`;
  if (yerVariant === 'قديم') return `${amount} (قديم)`;
  return amount;
}
