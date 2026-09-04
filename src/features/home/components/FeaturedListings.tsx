import { Container } from '@/components/ui/container';
import { ListingsCarousel } from '@/features/home/components/ListingsCarousel';
import { HOME_LISTINGS_PER_TYPE } from '@/features/home/constants/home-listings';
import { homeListingsService } from '@/features/home/services/home-listings-service';
import { HomePropertyTypeSection } from '@/features/home/types/home-listings';
import { getServerTranslations } from '@/lib/i18n/server';
import { ApiError } from '@/lib/errors/api-error';

export async function FeaturedListings() {
  const [{ t }, listingsResult] = await Promise.all([
    getServerTranslations(),
    homeListingsService.getByPropertyType(HOME_LISTINGS_PER_TYPE).then(
      (sections) => ({ sections, error: false }),
      (e: unknown) => ({
        sections: [] as HomePropertyTypeSection[],
        error: !(e instanceof ApiError && e.status === 404),
      }),
    ),
  ]);

  const { sections, error } = listingsResult;
  const hasListings = sections.some((section) => section.listings.length > 0);

  if (error) {
    return (
      <section className="py-14 bg-surface">
        <Container>
          <div className="rounded-2xl border border-red-100 bg-red-50/80 px-6 py-12 text-center">
            <p className="text-secondary-dark font-medium">{t('featured.error')}</p>
          </div>
        </Container>
      </section>
    );
  }

  if (!hasListings) {
    return (
      <section className="py-14 bg-surface">
        <Container>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-gray-500">{t('featured.empty')}</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <ListingsCarousel
      sections={sections}
      title={t('featured.title')}
      subtitle={t('featured.subtitle')}
      viewAllLabel={t('featured.viewAll')}
    />
  );
}
