'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { AppNotification, CursorPage } from '@/features/notifications/types/notification';
import {
  dispatchNotificationsRefresh,
  getMyNotificationsClient,
  isNotificationUnread,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_REFRESH_EVENT,
  resolveNotificationHref,
} from '@/features/notifications/services/notification-client';

interface NotificationsPanelProps {
  audience: 'dashboard' | 'admin';
  initial: CursorPage<AppNotification>;
}

function formatWhen(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-YE' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function NotificationsPanel({ audience, initial }: NotificationsPanelProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [items, setItems] = useState(initial.items);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getMyNotificationsClient({ limit: '50' });
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('notifications.loadFailed'));
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    void load({ silent: true });
    const onRefresh = () => void load({ silent: true });
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
  }, [load]);

  const handleOpen = async (notification: AppNotification) => {
    const href = resolveNotificationHref(notification, audience);
    if (isNotificationUnread(notification)) {
      try {
        await markNotificationRead(notification.id);
        dispatchNotificationsRefresh();
        router.refresh();
        void load({ silent: true });
      } catch {
        // navigate anyway when possible
      }
    }
    if (href) router.push(href);
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      dispatchNotificationsRefresh();
      router.refresh();
      await load({ silent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('notifications.loadFailed'));
    } finally {
      setMarkingAll(false);
    }
  };

  const hasUnread = items.some(isNotificationUnread);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">{t('notifications.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {audience === 'admin' ? t('notifications.adminSubtitle') : t('notifications.subtitle')}
          </p>
        </div>
        {hasUnread ? (
          <Button type="button" variant="outline" size="sm" disabled={markingAll} onClick={() => void handleMarkAllRead()}>
            {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            {t('notifications.markAllRead')}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-16 text-center shadow-[var(--shadow-soft)]">
          <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">{t('notifications.empty')}</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)]">
          {items.map((notification) => {
            const unread = isNotificationUnread(notification);
            const href = resolveNotificationHref(notification, audience);
            const content = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-semibold', unread ? 'text-primary-dark' : 'text-gray-600')}>
                    {notification.title}
                  </p>
                  {unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden /> : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">{notification.message}</p>
                <p className="mt-2 text-[11px] text-gray-400">{formatWhen(notification.created_at, locale)}</p>
              </>
            );

            return (
              <li key={notification.id}>
                {href ? (
                  <button
                    type="button"
                    onClick={() => void handleOpen(notification)}
                    className={cn(
                      'block w-full px-4 py-3 text-start transition-colors hover:bg-gray-50',
                      unread && 'bg-brand-muted/30',
                    )}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={cn('px-4 py-3', unread && 'bg-brand-muted/30')}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
