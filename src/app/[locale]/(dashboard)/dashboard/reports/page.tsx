import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { listingService } from '@/features/listings/services/listing-service';
import { MyReportsList } from '@/features/listings/components/MyReportsList';

export default async function DashboardReportsPage() {
  const { t } = await getServerTranslations();
  const { items, next_cursor, has_more } = await listingService.getMyReports({ limit: 24 });

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.reports')}</h1>
      <p className="mt-1 text-sm text-gray-500">{t('dashboard.reports.hint')}</p>

      <div className="mt-6">
        <MyReportsList initialItems={items} initialCursor={next_cursor} initialHasMore={has_more} />
      </div>
    </Container>
  );
}
