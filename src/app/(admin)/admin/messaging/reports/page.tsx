import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { AdminConversationReportsPanel } from '@/features/admin/components/messaging/AdminConversationReportsPanel';
import { getAdminNavBadges } from '@/features/admin/services/admin-dashboard-service';
import { getAdminReports } from '@/features/messaging/services/messaging-service';
import { getServerTranslations } from '@/lib/i18n/server';

interface AdminMessagingReportsPageProps {
  searchParams: Promise<{ status?: string }>;
}

async function AdminMessagingReportsContent({ status }: { status?: string }) {
  const { t } = await getServerTranslations();
  const [badges, reports] = await Promise.all([
    getAdminNavBadges(),
    getAdminReports({ limit: '24', ...(status ? { status } : {}) }),
  ]);

  return (
    <>
      <h1 className="text-2xl font-bold text-primary-dark">{t('admin.messaging.reports')}</h1>
      <p className="mt-1 text-sm text-gray-500">{t('admin.messaging.reportsHint')}</p>

      <div className="mt-6">
        <AdminConversationReportsPanel
          initialItems={reports.items}
          initialCursor={reports.next_cursor}
          initialHasMore={reports.has_more}
          initialStatus={status}
          totalReports={badges.total_conversation_reports}
          pendingReports={badges.pending_conversation_reports}
        />
      </div>
    </>
  );
}

export default async function AdminMessagingReportsPage({ searchParams }: AdminMessagingReportsPageProps) {
  const params = await searchParams;

  return (
    <Container className="py-8">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-gray-100" />}>
        <AdminMessagingReportsContent status={params.status} />
      </Suspense>
    </Container>
  );
}
