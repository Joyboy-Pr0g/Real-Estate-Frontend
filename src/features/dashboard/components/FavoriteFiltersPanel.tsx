'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bookmark, Bell, Trash2 } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { FavoriteFilterItem } from '@/features/listings/types/favorite-filter';
import { buildListingsUrlFromSavedFilters } from '@/features/listings/lib/serialize-listing-filters';
import {
  deleteFavoriteFilter,
  loadMoreFavoriteFilters,
} from '@/features/listings/services/favorite-filter-client';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface FavoriteFiltersPanelProps {
  initialItems: FavoriteFilterItem[];
  initialCursor: string | null;
  initialHasMore: boolean;
}

export function FavoriteFiltersPanel({
  initialItems,
  initialCursor,
  initialHasMore,
}: FavoriteFiltersPanelProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteFavoriteFilter(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success(t('dashboard.favoriteFilters.deleted'));
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await loadMoreFavoriteFilters({ cursor, limit: '24' });
      setItems((current) => [...current, ...page.items]);
      setCursor(page.next_cursor);
      setHasMore(page.has_more);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-12 text-center">
        <p className="text-sm text-gray-500">{t('dashboard.favoriteFilters.empty')}</p>
        <ButtonLink href="/listings" className="mt-4" variant="primaryOutline">
          {t('nav.listings')}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-muted text-brand">
                <Bookmark className="h-4 w-4" />
              </span>
              <h2 className="truncate text-base font-bold text-primary-dark">{item.name}</h2>
            </div>
            {item.email_notifications ? (
              <p className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <Bell className="h-3.5 w-3.5" />
                {t('dashboard.favoriteFilters.emailEnabled')}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href={buildListingsUrlFromSavedFilters(item.filters)} variant="primaryOutline">
              {t('dashboard.favoriteFilters.apply')}
            </ButtonLink>
            <Button
              type="button"
              variant="dangerOutline"
              disabled={deletingId === item.id}
              onClick={() => void handleDelete(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('dashboard.favoriteFilters.delete')}
            </Button>
          </div>
        </div>
      ))}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button type="button" variant="outline" disabled={loadingMore} onClick={() => void handleLoadMore()}>
            {loadingMore ? t('search.loading') : t('dashboard.favoriteFilters.loadMore')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
