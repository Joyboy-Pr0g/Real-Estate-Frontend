import { CitiesCarousel } from '@/features/home/components/CitiesCarousel';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { Container } from '@/components/ui/container';
import { getServerTranslations } from '@/lib/i18n/server';
import { ApiError } from '@/lib/errors/api-error';

export async function ExploreCities() {
  const { t } = await getServerTranslations();

  let cities: Awaited<ReturnType<typeof catalogService.getCities>> = [];
  let error = false;

  try {
    cities = await catalogService.getCities();
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 404)) {
      error = true;
    }
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <Container>
          <div className="rounded-2xl border border-red-100 bg-red-50/80 px-6 py-12 text-center">
            <p className="text-secondary-dark font-medium">{t('explore.error')}</p>
          </div>
        </Container>
      </section>
    );
  }

  if (cities.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <Container>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-gray-500">{t('explore.empty')}</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <CitiesCarousel
      cities={cities}
      title={t('explore.title')}
      subtitle={t('explore.subtitle')}
    />
  );
}
