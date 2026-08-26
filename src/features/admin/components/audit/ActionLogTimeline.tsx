'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import { ACTION_LABEL_KEYS } from '@/features/admin/components/audit/action-log-utils';

interface ActionLogTimelineItem {
  id: string;
  actor_name: string;
  action: string;
  reason: string | null;
  created_at: string;
}

interface ActionLogTimelineProps {
  items: ActionLogTimelineItem[];
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  emptyLabel: string;
}

export function ActionLogTimeline({
  items,
  hasMore = false,
  loading = false,
  onLoadMore,
  emptyLabel,
}: ActionLogTimelineProps) {
  const { t } = useLocale();

  if (items.length === 0) {
    return <p className="text-sm text-gray-400">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((entry) => {
        const actionLabel = ACTION_LABEL_KEYS[entry.action]
          ? t(ACTION_LABEL_KEYS[entry.action])
          : entry.action;

        return (
          <div key={entry.id} className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-primary-dark">{actionLabel}</p>
                <p className="text-xs text-gray-500">{entry.actor_name}</p>
              </div>
              <time className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</time>
            </div>

            {entry.reason ? (
              <p className="mt-2 text-xs text-gray-500">
                {t('admin.actionReason')}: {entry.reason}
              </p>
            ) : null}
          </div>
        );
      })}

      {hasMore && onLoadMore ? (
        <div className="flex justify-center pt-1">
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={onLoadMore}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('admin.loadMore')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
