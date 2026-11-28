import { notFound } from 'next/navigation';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { featureService } from '@/features/catalog/services/feature-service';
import { listingService } from '@/features/listings/services/listing-service';
import { EditListingForm } from '@/features/listings/components/dashboard/EditListingForm';

interface EditOfficeListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOfficeListingPage({ params }: EditOfficeListingPageProps) {
  const { id } = await params;
  const { t } = await getServerTranslations();

  const listing = await listingService.getMyListingById(id);
  if (!listing) notFound();

  const [cities, initialNeighborhoods, mainFeatures] = await Promise.all([
    catalogService.getCities(),
    catalogService.getNeighborhoodsByCity(listing.city.id),
    featureService.getMainFeatures(),
  ]);

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.listings.editTitle')}</h1>

      <div className="mt-6">
        <EditListingForm
          listing={listing}
          cities={cities}
          initialNeighborhoods={initialNeighborhoods}
          mainFeatures={mainFeatures}
          redirectPath="/dashboard/office/listings"
        />
      </div>
    </Container>
  );
}
