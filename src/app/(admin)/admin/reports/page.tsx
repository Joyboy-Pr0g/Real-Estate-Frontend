import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { getServerTranslations } from '@/lib/i18n/server';
import { getAdminNavBadges } from '@/features/admin/services/admin-dashboard-service';
import { getAdminListingReports } from '@/features/admin/services/admin-listing-reports-service';
import { AdminListingReportsPanel } from '@/features/admin/components/listing-reports/AdminListingReportsPanel';

interface AdminReportsPageProps {
  searchParams: Promise<{ status?: string }>;
}

async function AdminReportsContent({ status }: { status?: string }) {
  const { t } = await getServerTranslations();
  const [badges, reports] = await Promise.all([
    getAdminNavBadges(),
    getAdminListingReports({ limit: 24, status }),
  ]);

  return (
    <>
      <h1 className="text-2xl font-bold text-primary-dark">{t('admin.listingReports.title')}</h1>
      <p className="mt-1 text-sm text-gray-500">{t('admin.listingReports.hint')}</p>

      <div className="mt-6">
        <AdminListingReportsPanel
          initialItems={reports.items}
          initialCursor={reports.next_cursor}
          initialHasMore={reports.has_more}
          initialStatus={status}
          totalReports={badges.total_listing_reports}
          pendingReports={badges.pending_listing_reports}
        />
      </div>
    </>
  );
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const params = await searchParams;

  return (
    <Container className="py-8">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-gray-100" />}>
        <AdminReportsContent status={params.status} />
      </Suspense>
    </Container>
  );
}
