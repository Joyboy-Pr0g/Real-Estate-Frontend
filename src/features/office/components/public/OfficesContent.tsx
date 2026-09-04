import { Container } from '@/components/ui/container';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { OfficesPageView } from '@/features/office/components/public/OfficesPageView';
import { publicOfficeService } from '@/features/office/services/public-office-service';
import { getServerTranslations } from '@/lib/i18n/server';
import { ApiError } from '@/lib/errors/api-error';

export interface OfficesSearchParams {
  cityId?: string;
  neighborhoodId?: string;
  search?: string;
  cursor?: string;
}

interface OfficesContentProps {
  searchParams: Promise<OfficesSearchParams>;
}

export async function OfficesContent({ searchParams }: OfficesContentProps) {
  const params = await searchParams;
  const { t } = await getServerTranslations();
  const catalog = await catalogService.getPublicCatalog();

  const selectedCity = params.cityId
    ? catalog.cities.find((city) => city.id === params.cityId)
    : undefined;

  const initialNeighborhoods = selectedCity
    ? await catalogService.getNeighborhoodsByCity(selectedCity.id)
    : [];

  let offices: Awaited<ReturnType<typeof publicOfficeService.search>>['items'] = [];
  let nextCursor: string | null = null;
  let hasMore = false;
  let error = false;

  try {
    const result = await publicOfficeService.search({
      cityId: params.cityId,
      neighborhoodId: params.neighborhoodId,
      search: params.search,
      limit: 24,
    });
    offices = result.items;
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
          <p className="font-medium text-secondary-dark">{t('offices.error')}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-14">
      <OfficesPageView
        cities={catalog.cities}
        offices={offices}
        nextCursor={nextCursor}
        hasMore={hasMore}
        initialNeighborhoods={initialNeighborhoods}
      />
    </Container>
  );
}
