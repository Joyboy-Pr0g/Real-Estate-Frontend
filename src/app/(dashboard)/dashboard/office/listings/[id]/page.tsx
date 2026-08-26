import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { listingService } from '@/features/listings/services/listing-service';
import { OfficeListingDetailView } from '@/features/listings/components/dashboard/OfficeListingDetailView';

interface OfficeListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OfficeListingDetailPage({ params }: OfficeListingDetailPageProps) {
  const user = await getSession();
  if (!user) redirect('/login');

  const { id } = await params;
  const listing = await listingService.getMyListingById(id);
  if (!listing) notFound();

  return (
    <Container className="py-8">
      <OfficeListingDetailView listing={listing} editHref={`/dashboard/office/listings/${listing.id}/edit`} />
    </Container>
  );
}
