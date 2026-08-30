'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, LayoutGrid, Map } from 'lucide-react';
import Link from 'next/link';
import { PublicCatalog } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';
import { ListingsFilterBar } from '@/features/listings/components/filter/ListingsFilterBar';
import { ListingsDiscoveryMap, MapViewLevel } from '@/features/listings/components/map/ListingsDiscoveryMap';
import { ListingsMapListingList } from '@/features/listings/components/map/ListingsMapListingList';
import { LISTING_URL_PARAMS } from '@/features/listings/constants/search-url-params';
import { ListingSearchQuery } from '@/features/listings/schemas/search-schema';
import { PublicListing } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

const MAP_PATH = '/listings/map';

interface ListingsMapPageViewProps {
  catalog: PublicCatalog;
  listings: PublicListing[];
  nextCursor: string | null;
  hasMore: boolean;
  initialNeighborhoods: PublicNeighborhood[];
  initialPropertySubtypes: PublicPropertySubtype[];
  isAuthenticated: boolean;
  viewLevel: MapViewLevel;
  resolvedFilters: ListingSearchQuery;
}

export function ListingsMapPageView({
  catalog,
  listings,
  nextCursor,
  hasMore,
  initialNeighborhoods,
  initialPropertySubtypes,
  isAuthenticated,
  viewLevel,
  resolvedFilters,
}: ListingsMapPageViewProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const queryKey = searchParams.toString();

  const cityPcode = searchParams.get(LISTING_URL_PARAMS.city) ?? '';
  const neighborhoodPcode = searchParams.get(LISTING_URL_PARAMS.neighborhood) ?? '';

  const selectedCity = useMemo(
    () => catalog.cities.find((city) => city.pcode === cityPcode) ?? null,
    [catalog.cities, cityPcode],
  );

  const selectedNeighborhood = useMemo(
    () => initialNeighborhoods.find((n) => n.neighb_pcode === neighborhoodPcode) ?? null,
    [initialNeighborhoods, neighborhoodPcode],
  );

  const filterQuery = queryKey ? `?${queryKey}` : '';

  return (
    <div className="flex h-[calc(100dvh-68px)] flex-col md:flex-row">
      <aside
        className={cn(
          'order-2 flex flex-col border-t border-gray-200 bg-white md:order-1 md:w-[min(420px,40vw)] md:border-t-0 md:border-e',
          sidebarOpen ? 'max-h-[46vh] md:max-h-none md:h-full' : 'h-12 md:h-full md:w-12',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 md:px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-primary-dark">
              {viewLevel === 'country'
                ? t('map.titleCountry')
                : viewLevel === 'city'
                  ? selectedCity?.name ?? t('map.titleCity')
                  : `${selectedCity?.name ?? ''} · ${selectedNeighborhood?.name ?? ''}`}
            </p>
            <p className="truncate text-xs text-gray-500">
              {viewLevel === 'country'
                ? t('map.hintCountry')
                : viewLevel === 'city'
                  ? t('map.hintCity')
                  : t('map.hintListings').replace('{count}', String(listings.length))}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/listings${filterQuery}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label={t('map.listView')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand-dark md:hidden"
              aria-label={t('map.toggleSidebar')}
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <ChevronDown className={cn('h-4 w-4 transition-transform', sidebarOpen && 'rotate-180')} />
            </button>
            <span className="hidden h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand-dark md:inline-flex">
              <Map className="h-4 w-4" />
            </span>
          </div>
        </div>

        {sidebarOpen ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-gray-100 px-2 py-2 md:px-3">
              <ListingsFilterBar
                catalog={catalog}
                initialNeighborhoods={initialNeighborhoods}
                initialPropertySubtypes={initialPropertySubtypes}
                isAuthenticated={isAuthenticated}
                basePath={MAP_PATH}
                className="!shadow-none !ring-0"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 md:px-4">
              {viewLevel === 'listings' ? (
                <ListingsMapListingList
                  initialListings={listings}
                  initialCursor={nextCursor}
                  initialHasMore={hasMore}
                  resolvedFilters={resolvedFilters}
                  queryKey={queryKey}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  {viewLevel === 'country' ? t('map.selectCityPrompt') : t('map.selectDistrictPrompt')}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </aside>

      <div className="order-1 min-h-[54vh] flex-1 md:order-2 md:min-h-0">
        <ListingsDiscoveryMap
          catalog={catalog}
          neighborhoods={initialNeighborhoods}
          listings={listings}
          viewLevel={viewLevel}
          selectedCity={selectedCity}
          selectedNeighborhood={selectedNeighborhood}
          className="h-full"
        />
      </div>
    </div>
  );
}
