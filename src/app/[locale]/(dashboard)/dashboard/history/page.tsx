import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { listingService } from '@/features/listings/services/listing-service';
import { ListingCursorGrid } from '@/features/listings/components/ListingCursorGrid';
import { bffPaths } from '@/lib/api/endpoints';

export default async function DashboardHistoryPage() {
  const { t } = await getServerTranslations();
  const { items, next_cursor, has_more } = await listingService.getMyViewHistory({ limit: 24 });

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.history')}</h1>

      <div className="mt-6">
        <ListingCursorGrid
          initialItems={items}
          initialCursor={next_cursor}
          initialHasMore={has_more}
          fetchPath={bffPaths.listings.myViewHistory}
          emptyMessageKey="dashboard.history.empty"
          removeAction="remove-view"
        />
      </div>
    </Container>
  );
}
