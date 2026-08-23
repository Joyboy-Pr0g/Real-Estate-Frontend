import { Container } from '@/components/ui/container';
import { ListingsCarousel } from '@/features/home/components/ListingsCarousel';
import { homeListingsService } from '@/features/home/services/home-listings-service';
import { listingService } from '@/features/listings/services/listing-service';
import { getServerTranslations } from '@/lib/i18n/server';
import { getSession } from '@/lib/auth/session';
import { ApiError } from '@/lib/errors/api-error';

export async function FeaturedListings() {
  const { t } = await getServerTranslations();

  let sections: Awaited<ReturnType<typeof homeListingsService.getByPropertyType>> = [];
  let error = false;

  try {
    sections = await homeListingsService.getByPropertyType(10);
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 404)) {
      error = true;
    }
  }

  const hasListings = sections.some((section) => section.listings.length > 0);
  const user = await getSession();
  const listingIds = sections.flatMap((section) => section.listings.map((listing) => listing.id));
  const savedIds = user ? await listingService.getSavedListingIds(listingIds) : [];

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
      isAuthenticated={Boolean(user)}
      savedIds={savedIds}
    />
  );
}
