import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { listingService } from '@/features/listings/services/listing-service';
import { EditListingForm } from '@/features/listings/components/dashboard/EditListingForm';
import { ListingActionLogsPanel } from '@/features/listings/components/dashboard/ListingActionLogsPanel';

interface EditOfficeListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOfficeListingPage({ params }: EditOfficeListingPageProps) {
  const user = await getSession();
  if (!user) redirect('/login');

  const { id } = await params;
  const { t } = await getServerTranslations();

  const listing = await listingService.getMyListingById(id);
  if (!listing) notFound();

  const [cities, initialNeighborhoods, officeLogs] = await Promise.all([
    catalogService.getCities(),
    catalogService.getNeighborhoodsByCity(listing.city.id),
    listingService.getListingOfficeActionLogs(id),
  ]);

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.listings.editTitle')}</h1>

      <div className="mt-6 space-y-8">
        <EditListingForm
          listing={listing}
          cities={cities}
          initialNeighborhoods={initialNeighborhoods}
          redirectPath="/dashboard/office/listings"
        />

        <ListingActionLogsPanel
          listingId={listing.id}
          mode="office"
          initialOfficeLogs={officeLogs}
        />
      </div>
    </Container>
  );
}
