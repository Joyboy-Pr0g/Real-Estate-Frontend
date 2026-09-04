'use client';

import { Suspense } from 'react';
import { PublicCity } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { OfficesFilterBar } from '@/features/office/components/public/OfficesFilterBar';
import { OfficesInfiniteGrid } from '@/features/office/components/public/OfficesInfiniteGrid';
import { PublicOfficeSummary } from '@/features/office/types/public-office';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { useLocale } from '@/lib/i18n/locale-provider';

interface OfficesPageViewProps {
  cities: PublicCity[];
  offices: PublicOfficeSummary[];
  nextCursor: string | null;
  hasMore: boolean;
  initialNeighborhoods?: PublicNeighborhood[];
}

function OfficesFilterFallback() {
  return <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />;
}

export function OfficesPageView({
  cities,
  offices,
  nextCursor,
  hasMore,
  initialNeighborhoods,
}: OfficesPageViewProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-primary-dark sm:text-3xl">{t('offices.title')}</h1>
        <p className="max-w-2xl text-sm text-gray-500 sm:text-base">{t('offices.subtitle')}</p>
      </div>

      <Suspense fallback={<OfficesFilterFallback />}>
        <OfficesFilterBar cities={cities} initialNeighborhoods={initialNeighborhoods} />
      </Suspense>

      <OfficesInfiniteGrid
        initialOffices={offices}
        initialCursor={nextCursor}
        initialHasMore={hasMore}
      />

      <ScrollToTopButton />
    </div>
  );
}
