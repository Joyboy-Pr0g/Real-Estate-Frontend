import type { YerVariant } from '@/features/listings/types/listing';

const yerFormatter = new Intl.NumberFormat('en-YE', {
  style: 'decimal',
  maximumFractionDigits: 0,
});

/** Formats listing prices in Yemeni Rial with old/new variant label. */
export function formatPriceYER(price: string | number, yerVariant: YerVariant = 'قديم'): string {
  const value = typeof price === 'string' ? parseFloat(price) : price;
  if (Number.isNaN(value)) return String(price);
  const amount = `${yerFormatter.format(value)} ر.ي`;
  if (yerVariant === 'جديد') return `${amount} (جديد)`;
  return `${amount} (قديم)`;
}

/** @deprecated Use `formatPriceYER` — kept as alias for existing imports. */
export const formatPrice = formatPriceYER;
