'use client';

import type { ReactNode } from 'react';
import { MessageListingButton } from '@/features/listings/components/detail/MessageListingButton';
import { ListingPriceType, ListingPriceTypeEnum, YerVariant } from '@/features/listings/types/listing';
import { formatPriceYER } from '@/lib/utils/currency';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ListingContactAsideProps {
  price: string;
  yerVariant: YerVariant;
  priceType: ListingPriceType;
  listingId: string;
  listingSlug: string;
  isAuthenticated: boolean;
  canStartMessage: boolean;
  children: ReactNode;
  className?: string;
}

export function ListingContactAside({
  price,
  yerVariant,
  priceType,
  listingId,
  listingSlug,
  isAuthenticated,
  canStartMessage,
  children,
  className,
}: ListingContactAsideProps) {
  const { t } = useLocale();
  const formattedPrice = formatPriceYER(price, yerVariant);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="rounded-2xl bg-white p-4 shadow-(--shadow-soft) ring-1 ring-gray-100">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xl font-bold tracking-tight text-primary-dark sm:text-2xl">{formattedPrice}</p>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
              priceType === ListingPriceTypeEnum.NEGOTIABLE
                ? 'bg-amber-50 text-amber-700 ring-amber-200'
                : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {priceType === ListingPriceTypeEnum.NEGOTIABLE ? t('card.negotiable') : t('card.fixed')}
          </span>
        </div>
      </div>

      {children}

      <MessageListingButton
        listingId={listingId}
        listingSlug={listingSlug}
        isAuthenticated={isAuthenticated}
        canStartMessage={canStartMessage}
        variant="bar"
        className="w-full"
      />
    </div>
  );
}
