import { Container } from '@/components/ui/container';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { ListingsPageView } from '@/features/listings/components/ListingsPageView';
import { listingService } from '@/features/listings/services/listing-service';
import { listingSearchParamsToQueryKey } from '@/features/listings/lib/listing-search-query-key';
import { resolveListingSearchParams } from '@/features/listings/services/resolve-listing-search';
import { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';
import { getServerTranslations } from '@/lib/i18n/server';
import { getSession } from '@/lib/auth/session';
import { ApiError } from '@/lib/errors/api-error';

interface ListingsContentProps {
  searchParams: Promise<ListingSearchUrlParams>;
}

export async function ListingsContent({ searchParams }: ListingsContentProps) {
  const params = await searchParams;
  const { t } = await getServerTranslations();
  const session = await getSession();
  const catalog = await catalogService.getPublicCatalog();

  let listings: Awaited<ReturnType<typeof listingService.search>>['items'] = [];
  let nextCursor: string | null = null;
  let hasMore = false;
  let error = false;

  try {
    const filters = await resolveListingSearchParams(params);
    const result = await listingService.search({ ...filters, limit: filters.limit ?? 24 });
    listings = result.items;
    nextCursor = result.next_cursor;
    hasMore = result.has_more;
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 404)) {
      error = true;
    }
  }

  if (error) {
    return (
      <Container className="py-14">
        <div className="rounded-2xl border border-red-100 bg-red-50/80 px-6 py-12 text-center">
          <p className="text-secondary-dark font-medium">{t('featured.error')}</p>
        </div>
      </Container>
    );
  }

  const initialSearchKey = listingSearchParamsToQueryKey(params);

  return (
    <Container className="py-10 md:py-14">
      <ListingsPageView
        catalog={catalog}
        listings={listings}
        nextCursor={nextCursor}
        hasMore={hasMore}
        initialSearchKey={initialSearchKey}
        isAuthenticated={Boolean(session)}
      />
    </Container>
  );
}
