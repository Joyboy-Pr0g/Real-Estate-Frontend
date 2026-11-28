import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { getAdminListingDetail, getAdminListingActionLogs } from '@/features/listings/services/admin-listings-service';
import { AdminListingDetailView } from '@/features/admin/components/listings/AdminListingDetailView';

interface AdminListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminListingDetailPage({ params }: AdminListingDetailPageProps) {
  const { id } = await params;
  const [listing, actionLogs] = await Promise.all([
    getAdminListingDetail(id),
    getAdminListingActionLogs(id),
  ]);
  if (!listing) notFound();

  return (
    <Container className="py-8">
      <AdminListingDetailView
        listing={listing}
        initialAdminLogs={actionLogs?.admin_logs}
        initialOfficeLogs={actionLogs?.office_logs}
      />
    </Container>
  );
}
