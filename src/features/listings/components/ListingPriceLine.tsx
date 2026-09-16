'use client';

import { ListingPriceType, YerVariant } from '@/features/listings/types/listing';
import { formatPriceYER } from '@/lib/utils/currency';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ListingPriceLineProps {
  price: string;
  priceType: ListingPriceType;
  yerVariant: YerVariant;
  priceClassName?: string;
  showNegotiableBadge?: boolean;
}

export function ListingPriceLine({
  price,
  priceType,
  yerVariant,
  priceClassName,
  showNegotiableBadge = true,
}: ListingPriceLineProps) {
  const { t } = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn('font-bold text-brand-dark', priceClassName)}>
        {formatPriceYER(price, yerVariant)}
      </span>
      {showNegotiableBadge && priceType === 'قابل للتفاوض' ? (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          {t('card.negotiable')}
        </span>
      ) : null}
    </div>
  );
}
