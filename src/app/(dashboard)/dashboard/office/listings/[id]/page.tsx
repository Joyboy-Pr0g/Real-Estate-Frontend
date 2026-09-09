import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { listingService } from '@/features/listings/services/listing-service';
import { OfficeListingDetailView } from '@/features/listings/components/dashboard/OfficeListingDetailView';

interface OfficeListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OfficeListingDetailPage({ params }: OfficeListingDetailPageProps) {
  const { id } = await params;
  const [listing, officeLogs] = await Promise.all([
    listingService.getMyListingById(id),
    listingService.getListingOfficeActionLogs(id),
  ]);
  if (!listing) notFound();

  return (
    <Container className="py-8">
      <OfficeListingDetailView
        listing={listing}
        editHref={`/dashboard/office/listings/${listing.id}/edit`}
        initialOfficeLogs={officeLogs}
      />
    </Container>
  );
}
