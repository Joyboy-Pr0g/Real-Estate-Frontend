'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ActionLogTimeline } from '@/features/admin/components/audit/ActionLogTimeline';
import { OfficeActionLogEntry, CursorPage } from '@/features/admin/types/action-logs';
import { OfficeUserMember } from '@/features/office/types/office';
import { clientFetch } from '@/lib/api/client';
import { useLocale } from '@/lib/i18n/locale-provider';

interface OfficeUserActionLogsPanelProps {
  officeId: string;
  member: OfficeUserMember;
  initialLogs: CursorPage<OfficeActionLogEntry>;
}

export function OfficeUserActionLogsPanel({ officeId, member, initialLogs }: OfficeUserActionLogsPanelProps) {
  const { t } = useLocale();
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!logs.has_more || !logs.next_cursor || loading) return;
    setLoading(true);
    try {
      const res = await clientFetch<OfficeActionLogEntry[]>(
        `/api/offices/${officeId}/users/${member.user_id}/action-logs`,
        { searchParams: { cursor: logs.next_cursor } },
      );
      setLogs((prev) => ({
        items: [...prev.items, ...(res.data ?? [])],
        next_cursor: res.next_cursor ?? null,
        has_more: Boolean(res.has_more),
      }));
    } finally {
      setLoading(false);
    }
  }, [loading, logs.has_more, logs.next_cursor, officeId, member.user_id]);

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/office/${officeId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand"
      >
        <ArrowRight className="h-4 w-4" />
        {t('dashboard.office.backToOffice')}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          {member.user.f_name} {member.user.l_name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{member.user.email}</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-var(--shadow-soft)">
        <h2 className="text-sm font-bold text-primary-dark">{t('admin.actionLogs')}</h2>
        <div className="mt-4">
          <ActionLogTimeline
            items={logs.items.map((entry) => ({
              id: entry.id,
              actor_name: entry.actor_name,
              action: entry.action,
              reason: entry.reason,
              created_at: entry.created_at,
            }))}
            hasMore={logs.has_more}
            loading={loading}
            onLoadMore={loadMore}
            emptyLabel={t('admin.noActionLogs')}
          />
        </div>
      </section>
    </div>
  );
}
