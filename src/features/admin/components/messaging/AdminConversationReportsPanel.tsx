'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import {
  fetchAdminConversationReports,
  updateAdminConversationReport,
} from '@/features/admin/services/admin-messaging-client';
import type { ConversationReportItem, ConversationReportStatus } from '@/features/messaging/types/messaging';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

const STATUS_STYLES: Record<ConversationReportStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  resolved: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  dismissed: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

const STATUS_OPTIONS: ConversationReportStatus[] = ['pending', 'reviewed', 'resolved', 'dismissed'];

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

function reportReasonLabel(reason: string, t: (key: TranslationKey) => string) {
  const key = `dashboard.messages.reason.${reason}` as TranslationKey;
  const translated = t(key);
  return translated === key ? reason : translated;
}

interface AdminConversationReportsPanelProps {
  initialItems: ConversationReportItem[];
  initialCursor: string | null;
  initialHasMore: boolean;
  initialStatus?: string;
  totalReports: number;
  pendingReports: number;
}

export function AdminConversationReportsPanel({
  initialItems,
  initialCursor,
  initialHasMore,
  initialStatus,
  totalReports,
  pendingReports,
}: AdminConversationReportsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConversationReportStatus>('resolved');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusFilter = searchParams.get('status') ?? initialStatus ?? '';

  const [prevItems, setPrevItems] = useState(initialItems);
  if (initialItems !== prevItems) {
    setPrevItems(initialItems);
    setItems(initialItems);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
  }

  const pushStatusFilter = (nextStatus: string) => {
    const params = new URLSearchParams();
    if (nextStatus) params.set('status', nextStatus);
    router.push(`/admin/messaging/reports${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loading) return;
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, string> = { cursor };
      if (statusFilter) params.status = statusFilter;
      const page = await fetchAdminConversationReports(params);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.next_cursor);
      setHasMore(page.has_more);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, statusFilter]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: '240px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const openAnswerModal = (report: ConversationReportItem) => {
    setActiveReportId(report.id);
    setStatus(report.status === 'pending' ? 'resolved' : report.status);
    setAdminNotes(report.admin_notes ?? '');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeReportId) return;
    setSubmitting(true);
    try {
      const response = await updateAdminConversationReport(activeReportId, {
        status,
        admin_notes: adminNotes.trim() || null,
      });
      if (response.data) {
        setItems((prev) => prev.map((item) => (item.id === response.data!.id ? response.data! : item)));
      }
      toast.success(t('admin.listingReports.updated'));
      setActiveReportId(null);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const activeReport = items.find((item) => item.id === activeReportId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-medium text-gray-400">{t('admin.messaging.reportsTotal')}</p>
          <p className="mt-1 text-2xl font-bold text-primary-dark">{totalReports}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-medium text-gray-400">{t('admin.messaging.reportsPending')}</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pendingReports}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'pending', 'reviewed', 'resolved', 'dismissed'].map((value) => (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => pushStatusFilter(value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === value
                ? 'bg-brand-muted text-brand-dark'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {value
              ? t(`dashboard.report.status.${value}` as TranslationKey)
              : t('dashboard.listings.allStatuses')}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <p className="text-gray-500">{t('admin.messaging.reportsEmpty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((report) => (
            <div key={report.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/listings/${report.listing.slug}`}
                    className="truncate text-sm font-bold text-primary-dark hover:text-brand-dark"
                  >
                    {report.listing.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    {reportReasonLabel(report.reason, t)} · {report.reporter.f_name} {report.reporter.l_name}
                  </p>
                  {report.description ? (
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{report.description}</p>
                  ) : null}
                  {report.admin_notes ? (
                    <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
                      <p className="text-xs font-medium text-gray-400">{t('admin.listingReports.adminNotes')}</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-primary-dark">{report.admin_notes}</p>
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[report.status])}>
                    {t(`dashboard.report.status.${report.status}` as TranslationKey)}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/messaging/conversations/${report.conversation_id}`}
                      className="text-sm text-brand hover:underline"
                    >
                      {t('admin.messaging.viewConversation')}
                    </Link>
                    <Button type="button" variant="outline" size="sm" onClick={() => openAnswerModal(report)}>
                      {t('admin.listingReports.answer')}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">{formatDateTime(report.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="flex min-h-8 items-center justify-center">
        {loading ? <p className="text-xs text-gray-400">…</p> : null}
        {error ? (
          <button type="button" onClick={() => void loadMore()} className="text-sm font-medium text-secondary hover:underline">
            {t('filters.loadMoreError')}
          </button>
        ) : null}
      </div>

      {activeReport ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            role="dialog"
            aria-modal="true"
            onSubmit={(event) => void handleSubmit(event)}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]"
          >
            <h2 className="text-lg font-bold text-primary-dark">{t('admin.messaging.reportsAnswerTitle')}</h2>
            <p className="mt-1 truncate text-sm text-gray-500">{activeReport.listing.title}</p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-primary-dark">{t('admin.listingReports.statusLabel')}</span>
                <select
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ConversationReportStatus)}
                  className={fieldClass}
                >
                  {STATUS_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {t(`dashboard.report.status.${value}` as TranslationKey)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-primary-dark">{t('admin.listingReports.adminNotes')}</span>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t('admin.listingReports.adminNotesPlaceholder')}
                  className={`${fieldClass} min-h-28 py-2.5`}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setActiveReportId(null)} disabled={submitting}>
                {t('admin.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? t('dashboard.submitting') : t('admin.save')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
