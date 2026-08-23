import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { getAdminListingDetail } from '@/features/listings/services/admin-listings-service';
import { AdminListingDetailView } from '@/features/admin/components/listings/AdminListingDetailView';

interface AdminListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminListingDetailPage({ params }: AdminListingDetailPageProps) {
  const { id } = await params;
  const listing = await getAdminListingDetail(id);
  if (!listing) notFound();

  return (
    <Container className="py-8">
      <AdminListingDetailView listing={listing} />
    </Container>
  );
}
