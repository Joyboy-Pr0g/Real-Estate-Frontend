import { catalogService } from '@/features/catalog/services/catalog-service';
import { ListingsMapPageView } from '@/features/listings/components/ListingsMapPageView';
import { MapViewLevel } from '@/features/listings/components/map/ListingsDiscoveryMap';
import { MAP_LISTINGS_PAGE_SIZE } from '@/features/listings/constants/map-config';
import { listingService } from '@/features/listings/services/listing-service';
import { listingSearchParamsToQueryKey } from '@/features/listings/lib/listing-search-query-key';
import { resolveListingSearchParams } from '@/features/listings/services/resolve-listing-search';
import { ListingSearchQuery } from '@/features/listings/schemas/search-schema';
import { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { ApiError } from '@/lib/errors/api-error';

interface ListingsMapContentProps {
  searchParams: Promise<ListingSearchUrlParams>;
}

function resolveViewLevel(params: ListingSearchUrlParams): MapViewLevel {
  const hasCity = Boolean(params.city);
  const hasNeighborhood = Boolean(params.neighborhood && params.neighborhood !== 'undefined');
  if (hasCity && hasNeighborhood) return 'listings';
  if (hasCity) return 'city';
  return 'country';
}

export async function ListingsMapContent({ searchParams }: ListingsMapContentProps) {
  const params = await searchParams;
  const { t } = await getServerTranslations();
  const session = await getSession();
  const catalog = await catalogService.getPublicCatalog();
  const viewLevel = resolveViewLevel(params);

  let listings: Awaited<ReturnType<typeof listingService.search>>['items'] = [];
  let nextCursor: string | null = null;
  let hasMore = false;
  let resolvedFilters: ListingSearchQuery = { limit: MAP_LISTINGS_PAGE_SIZE };
  let error = false;

  if (viewLevel === 'listings') {
    try {
      resolvedFilters = await resolveListingSearchParams(params);
      const result = await listingService.search({
        ...resolvedFilters,
        limit: MAP_LISTINGS_PAGE_SIZE,
      });
      listings = result.items;
      nextCursor = result.next_cursor;
      hasMore = result.has_more;
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 404)) {
        error = true;
      }
    }
  }

  if (error) {
    return (
      <div className="flex h-[calc(100dvh-68px)] items-center justify-center bg-red-50/50 px-6">
        <p className="text-secondary-dark font-medium">{t('featured.error')}</p>
      </div>
    );
  }

  const initialSearchKey = listingSearchParamsToQueryKey(params);

  return (
    <ListingsMapPageView
      catalog={catalog}
      listings={listings}
      nextCursor={nextCursor}
      hasMore={hasMore}
      initialSearchKey={initialSearchKey}
      isAuthenticated={Boolean(session)}
    />
  );
}
