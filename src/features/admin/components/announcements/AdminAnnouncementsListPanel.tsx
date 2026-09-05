'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, Megaphone, Plus, Send } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { Button, ButtonLink } from '@/components/ui/button';
import { AnnouncementCard } from '@/features/admin/components/announcements/AnnouncementCard';
import { AnnouncementTable } from '@/features/admin/components/announcements/AnnouncementTable';
import { fetchAdminAnnouncements } from '@/features/admin/services/admin-announcements-client';
import type { AnnouncementStatus, AnnouncementsPage } from '@/features/admin/types/admin-announcement';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { useLocale } from '@/lib/i18n/locale-provider';

const STATUSES: AnnouncementStatus[] = ['draft', 'scheduled', 'sending', 'sent', 'failed'];

interface AdminAnnouncementsListPanelProps {
  initial: AnnouncementsPage;
  initialStatus?: AnnouncementStatus | '';
}

export function AdminAnnouncementsListPanel({ initial, initialStatus = '' }: AdminAnnouncementsListPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const canSend = hasPermission('announcements.send');
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [items, setItems] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
  }

  const applyFilter = useCallback(
    (status: string) => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyFilter(statusFilter);
  }, [statusFilter, applyFilter]);

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const params: Record<string, string> = { cursor: nextCursor, limit: '30' };
      if (statusFilter) params.status = statusFilter;
      const page = await fetchAdminAnnouncements(params);
      setItems((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbItems={[{ labelKey: 'admin.announcements.campaigns', icon: Megaphone }]}
        title={t('admin.announcements.campaignsTitle')}
        countLabel={t('admin.announcements.count').replace('{count}', String(items.length))}
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AnnouncementStatus | '')}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            >
              <option value="">{t('admin.announcements.allStatuses')}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`admin.announcements.status.${status}` as const)}
                </option>
              ))}
            </select>
            {canSend ? (
              <ButtonLink href="/admin/announcements/send" size="sm">
                <Plus className="h-4 w-4" />
                {t('admin.announcements.newBroadcast')}
              </ButtonLink>
            ) : null}
          </div>
        }
      />

      <p className="text-sm text-gray-500">{t('admin.announcements.campaignsHint')}</p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-var(--shadow-soft)">
          <Megaphone className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">{t('admin.announcements.empty')}</p>
          {canSend ? (
            <ButtonLink href="/admin/announcements/send" className="mt-4" size="sm">
              <Send className="h-4 w-4" />
              {t('admin.announcements.sendFirst')}
            </ButtonLink>
          ) : null}
        </div>
      ) : (
        <>
          <AnnouncementTable items={items} />
          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Button type="button" variant="outline" disabled={isPending} onClick={loadMore}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('admin.loadMore')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
