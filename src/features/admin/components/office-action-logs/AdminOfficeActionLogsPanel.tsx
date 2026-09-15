'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { toast } from '@/components/ui/toaster';
import { ActionLogTimeline } from '@/features/admin/components/audit/ActionLogTimeline';
import {
  bulkDeleteOfficeActionLogs,
  getAdminOfficeActionLogs,
} from '@/features/admin/services/admin-action-logs-client';
import { AdminOfficeActionLogEntry, CursorPage } from '@/features/admin/types/action-logs';
import { searchOfficesForSelect } from '@/features/office/services/admin-offices-client';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import { ACTION_LABEL_KEYS } from '@/features/admin/components/audit/action-log-utils';

interface AdminOfficeActionLogsPanelProps {
  initial: CursorPage<AdminOfficeActionLogEntry>;
  initialOfficeId?: string;
  initialOfficeLabel?: string;
}

export function AdminOfficeActionLogsPanel({
  initial,
  initialOfficeId = '',
  initialOfficeLabel = '',
}: AdminOfficeActionLogsPanelProps) {
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [canSelect, setCanSelect] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial.items);
    setCursor(initial.next_cursor);
    setHasMore(initial.has_more);
    setSelected(new Set());
  }

  const officeId = searchParams.get('office_id') ?? initialOfficeId;

  const updateOfficeFilter = (value: string, _label: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('office_id', value);
    else params.delete('office_id');
    params.delete('cursor');
    router.push(`/admin/office-action-logs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loading) return;
    setLoading(true);
    try {
      const page = await getAdminOfficeActionLogs({
        office_id: officeId || undefined,
        cursor,
      });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.next_cursor);
      setHasMore(page.has_more);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, officeId]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((item) => item.id)));
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      const deleted = await bulkDeleteOfficeActionLogs([...selected]);
      toast.success(t('admin.officeActionLogsDeleted').replace('{count}', String(deleted)));
      setSelected(new Set());
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">{t('admin.officeActionLogsTitle')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('admin.officeActionLogsSubtitle')}</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="min-w-[240px] flex-1">
          <SearchableSelect
            value={officeId}
            selectedLabel={initialOfficeLabel}
            onChange={updateOfficeFilter}
            fetchOptions={searchOfficesForSelect}
            placeholder={t('admin.searchOffice')}
            className="w-full"
          />
        </div>

        {hasPermission('office_action_logs.bulk_delete') ? (
          !canSelect ? (
            <Button type="button" variant="outline" onClick={() => setCanSelect(true)} className="hidden sm:block rounded-xl">
              {t('admin.select')}
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => setCanSelect(false)} className="hidden sm:block rounded-xl">
              {t('admin.unSelect')}
            </Button>
          )
        ) : null}
      </div>

      {selected.size > 0 && hasPermission('office_action_logs.bulk_delete') ? (
        <Button variant="dangerOutline" onClick={() => void handleBulkDelete()} className="rounded-xl">
          {t('admin.deleteSelected').replace('{count}', String(selected.size))}
        </Button>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <p className="text-gray-500">{t('admin.noActionLogs')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)]">
          {canSelect ? (
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
              <input
                type="checkbox"
                checked={items.length > 0 && selected.size === items.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300"
                aria-label={t('admin.selectAll')}
              />
              <span className="text-xs text-gray-400">{t('admin.selectAll')}</span>
            </div>
          ) : null}

          <div className="divide-y divide-gray-50">
            {items.map((entry) => {
              const actionLabel = ACTION_LABEL_KEYS[entry.action]
                ? t(ACTION_LABEL_KEYS[entry.action])
                : entry.action;

              return (
                <div key={entry.id} className="flex gap-3 px-4 py-4">
                  {canSelect ? (
                    <input
                      type="checkbox"
                      checked={selected.has(entry.id)}
                      onChange={() => toggleSelect(entry.id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300"
                      aria-label={actionLabel}
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-primary-dark">{actionLabel}</p>
                        <p className="text-xs text-gray-500">
                          {entry.office_name} · {entry.actor_name}
                        </p>
                      </div>
                      <time className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</time>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {entry.entity_type} · {entry.entity_id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore ? (
            <div className="flex justify-center border-t border-gray-100 p-4">
              <Button type="button" variant="outline" disabled={loading || isPending} onClick={() => void loadMore()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t('admin.loadMore')}
              </Button>
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
}
