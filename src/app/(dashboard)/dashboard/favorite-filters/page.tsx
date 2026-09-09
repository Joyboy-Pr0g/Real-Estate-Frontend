import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { getMyFavoriteFilters } from '@/features/listings/services/favorite-filter-service';
import { FavoriteFiltersPanel } from '@/features/dashboard/components/FavoriteFiltersPanel';

export default async function DashboardFavoriteFiltersPage() {
  const { t } = await getServerTranslations();
  const { items, next_cursor, has_more } = await getMyFavoriteFilters({ limit: '24' });

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.favoriteFilters.title')}</h1>
      <p className="mt-2 text-sm text-gray-500">{t('dashboard.favoriteFilters.subtitle')}</p>

      <div className="mt-6">
        <FavoriteFiltersPanel
          initialItems={items}
          initialCursor={next_cursor}
          initialHasMore={has_more}
        />
      </div>
    </Container>
  );
}
