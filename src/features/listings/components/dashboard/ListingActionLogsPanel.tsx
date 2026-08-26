'use client';

import { useState } from 'react';
import { ActionLogTimeline } from '@/features/admin/components/audit/ActionLogTimeline';
import {
  AdminActionLogEntry,
  CursorPage,
  ListingActionLogsBundle,
  OfficeActionLogEntry,
} from '@/features/admin/types/action-logs';
import {
  getAdminListingActionLogs,
  getListingOfficeActionLogs,
} from '@/features/listings/services/listing-action-logs-client';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ListingActionLogsPanelProps {
  listingId: string;
  mode: 'admin' | 'office';
  initialAdminLogs?: CursorPage<AdminActionLogEntry>;
  initialOfficeLogs?: CursorPage<OfficeActionLogEntry>;
}

function toTimelineItems<T extends { actor_name?: string; admin_name?: string }>(
  entries: Array<T & { action: string; changes_json: Record<string, unknown> | null; reason: string | null; created_at: string; id: string }>,
) {
  return entries.map((entry) => ({
    id: entry.id,
    actor_name: ('actor_name' in entry && entry.actor_name) || ('admin_name' in entry && entry.admin_name) || '—',
    action: entry.action,
    changes_json: entry.changes_json,
    reason: entry.reason,
    created_at: entry.created_at,
  }));
}

export function ListingActionLogsPanel({
  listingId,
  mode,
  initialAdminLogs,
  initialOfficeLogs,
}: ListingActionLogsPanelProps) {
  const { t } = useLocale();
  const [adminLogs, setAdminLogs] = useState(initialAdminLogs ?? { items: [], next_cursor: null, has_more: false });
  const [officeLogs, setOfficeLogs] = useState(initialOfficeLogs ?? { items: [], next_cursor: null, has_more: false });
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [loadingOffice, setLoadingOffice] = useState(false);

  const loadMoreAdmin = async () => {
    if (!adminLogs.has_more || !adminLogs.next_cursor || loadingAdmin) return;
    setLoadingAdmin(true);
    try {
      const bundle = await getAdminListingActionLogs(listingId, {
        admin_cursor: adminLogs.next_cursor,
      });
      setAdminLogs((prev) => ({
        items: [...prev.items, ...bundle.admin_logs.items],
        next_cursor: bundle.admin_logs.next_cursor,
        has_more: bundle.admin_logs.has_more,
      }));
    } finally {
      setLoadingAdmin(false);
    }
  };

  const loadMoreOffice = async () => {
    if (!officeLogs.has_more || !officeLogs.next_cursor || loadingOffice) return;
    setLoadingOffice(true);
    try {
      if (mode === 'admin') {
        const bundle = await getAdminListingActionLogs(listingId, {
          office_cursor: officeLogs.next_cursor,
        });
        setOfficeLogs((prev) => ({
          items: [...prev.items, ...bundle.office_logs.items],
          next_cursor: bundle.office_logs.next_cursor,
          has_more: bundle.office_logs.has_more,
        }));
      } else {
        const page = await getListingOfficeActionLogs(listingId, { cursor: officeLogs.next_cursor });
        setOfficeLogs((prev) => ({
          items: [...prev.items, ...page.items],
          next_cursor: page.next_cursor,
          has_more: page.has_more,
        }));
      }
    } finally {
      setLoadingOffice(false);
    }
  };

  if (mode === 'office') {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-bold text-primary-dark">{t('admin.actionLogs')}</h2>
        <div className="mt-4">
          <ActionLogTimeline
            items={toTimelineItems(officeLogs.items)}
            hasMore={officeLogs.has_more}
            loading={loadingOffice}
            onLoadMore={loadMoreOffice}
            emptyLabel={t('admin.noActionLogs')}
          />
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-bold text-primary-dark">{t('admin.adminActionLogs')}</h2>
        <div className="mt-4">
          <ActionLogTimeline
            items={toTimelineItems(adminLogs.items)}
            hasMore={adminLogs.has_more}
            loading={loadingAdmin}
            onLoadMore={loadMoreAdmin}
            emptyLabel={t('admin.noActionLogs')}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-bold text-primary-dark">{t('admin.officeActionLogs')}</h2>
        <div className="mt-4">
          <ActionLogTimeline
            items={toTimelineItems(officeLogs.items)}
            hasMore={officeLogs.has_more}
            loading={loadingOffice}
            onLoadMore={loadMoreOffice}
            emptyLabel={t('admin.noActionLogs')}
          />
        </div>
      </section>
    </div>
  );
}

export type { ListingActionLogsBundle };
