'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Megaphone, RefreshCw } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { useTransition } from 'react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { Button } from '@/components/ui/button';
import {
  AnnouncementReadsChart,
  BreakdownBarChart,
} from '@/features/admin/components/announcements/AnnouncementAnalyticsCharts';
import { AnnouncementHtmlPreview } from '@/features/admin/components/announcements/AnnouncementRichEditor';
import type { AnnouncementDetail, AnnouncementStatus } from '@/features/admin/types/admin-announcement';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

const ROLE_LABEL_KEYS: Record<string, TranslationKey> = {
  buyer: 'admin.announcements.role.buyer',
  office: 'admin.announcements.role.office',
  individual_lister: 'admin.announcements.role.individual_lister',
};

const PLATFORM_LABEL_KEYS: Record<string, TranslationKey> = {
  web: 'admin.announcements.platform.web',
  android: 'admin.announcements.platform.android',
  ios: 'admin.announcements.platform.ios',
  other: 'admin.announcements.platform.other',
};

function labelForRole(role: string, t: (key: TranslationKey) => string): string {
  const key = ROLE_LABEL_KEYS[role];
  return key ? t(key) : role;
}

function labelForPlatform(platform: string, t: (key: TranslationKey) => string): string {
  const key = PLATFORM_LABEL_KEYS[platform];
  return key ? t(key) : platform;
}

function statusBadgeClass(status: AnnouncementStatus): string {
  switch (status) {
    case 'sent':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    case 'sending':
      return 'bg-blue-50 text-blue-700 ring-blue-100';
    case 'scheduled':
      return 'bg-violet-50 text-violet-700 ring-violet-100';
    case 'failed':
      return 'bg-red-50 text-red-700 ring-red-100';
    default:
      return 'bg-gray-100 text-gray-600 ring-gray-200';
  }
}

function formatDuration(ms: number | null, t: (key: import('@/lib/i18n/ar').TranslationKey) => string): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${minutes}m ${rem}s`;
}

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-primary-dark">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

interface AdminAnnouncementDetailPanelProps {
  announcement: AnnouncementDetail;
}

export function AdminAnnouncementDetailPanel({ announcement }: AdminAnnouncementDetailPanelProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [isPending, startTransition] = useTransition();

  const sanitizedHtml = DOMPurify.sanitize(announcement.body_html);

  const roleLabels = announcement.read_by_role.map((row) => labelForRole(row.role, t));
  const roleRates = announcement.read_by_role.map((row) => row.read_rate);

  const platformLabels = announcement.read_by_platform.map((row) => labelForPlatform(row.platform, t));
  const platformCounts = announcement.read_by_platform.map((row) => row.read_count);

  const refresh = () => {
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.announcements.campaigns', href: '/admin/announcements/campaigns', icon: Megaphone },
          { labelKey: 'admin.announcements.detail', icon: Megaphone },
        ]}
        title={announcement.title}
        countLabel=""
        filters={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={refresh}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {t('admin.announcements.refresh')}
            </Button>
            <Link
              href="/admin/announcements/campaigns"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-dark"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('admin.announcements.backToCampaigns')}
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset', statusBadgeClass(announcement.status))}>
          {t(`admin.announcements.status.${announcement.status}` as const)}
        </span>
        <span className="text-sm text-gray-500">
          {t(`admin.announcements.audience.${announcement.audience}` as const)}
        </span>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t('admin.announcements.metricTarget')}
          value={announcement.target_user_count}
        />
        <MetricCard
          label={t('admin.announcements.metricInApp')}
          value={announcement.in_app_created_count}
        />
        <MetricCard
          label={t('admin.announcements.metricPushSuccess')}
          value={announcement.push_success_count}
          hint={`${announcement.push_attempted_count} ${t('admin.announcements.attempted')}`}
        />
        <MetricCard
          label={t('admin.announcements.metricReadRate')}
          value={`${announcement.read_rate}%`}
          hint={`${announcement.read_count} ${t('admin.announcements.reads')}`}
        />
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-primary-dark">{t('admin.announcements.operationalMetrics')}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500">{t('admin.announcements.sentBy')}</dt>
            <dd className="mt-0.5 text-sm font-medium text-gray-800">
              {announcement.created_by_admin_name || announcement.created_by_admin_id}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">{t('admin.announcements.sentAt')}</dt>
            <dd className="mt-0.5 text-sm text-gray-800">
              {announcement.sent_at ? formatDateTime(announcement.sent_at) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">{t('admin.announcements.scheduledFor')}</dt>
            <dd className="mt-0.5 text-sm text-gray-800">
              {announcement.scheduled_at ? formatDateTime(announcement.scheduled_at) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">{t('admin.announcements.duration')}</dt>
            <dd className="mt-0.5 text-sm text-gray-800">{formatDuration(announcement.duration_ms, t)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">{t('admin.announcements.firstRead')}</dt>
            <dd className="mt-0.5 text-sm text-gray-800">
              {announcement.first_read_at ? formatDateTime(announcement.first_read_at) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">{t('admin.announcements.noToken')}</dt>
            <dd className="mt-0.5 text-sm text-gray-800">{announcement.no_token_count}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">{t('admin.announcements.pushFailures')}</dt>
            <dd className="mt-0.5 text-sm text-gray-800">{announcement.push_failure_count}</dd>
          </div>
        </dl>
      </section>

      {announcement.reads_over_time.length > 0 ? (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-primary-dark">{t('admin.announcements.readsOverTime')}</h2>
          <AnnouncementReadsChart buckets={announcement.reads_over_time} />
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {announcement.read_by_role.length > 0 ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-primary-dark">{t('admin.announcements.audienceBreakdown')}</h2>
            <BreakdownBarChart
              title={t('admin.announcements.readRateByRole')}
              labels={roleLabels}
              values={roleRates}
              color="#2563eb"
            />
            <ul className="mt-3 space-y-1 text-xs text-gray-600">
              {announcement.read_by_role.map((row) => (
                <li key={row.role}>
                  {labelForRole(row.role, t)}: {row.read_count}/{row.total_count} ({row.read_rate}%)
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {announcement.read_by_platform.length > 0 ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-primary-dark">{t('admin.announcements.platformBreakdown')}</h2>
            <BreakdownBarChart
              title={t('admin.announcements.readsByPlatform')}
              labels={platformLabels}
              values={platformCounts}
              color="#1e6b45"
            />
            {announcement.push_platform_snapshot ? (
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <p>Web tokens: {announcement.push_platform_snapshot.web}</p>
                <p>Android: {announcement.push_platform_snapshot.android}</p>
                <p>iOS: {announcement.push_platform_snapshot.ios}</p>
                <p>Other: {announcement.push_platform_snapshot.other}</p>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      {announcement.error_samples.length > 0 ? (
        <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
          <h2 className="text-sm font-semibold text-red-900">{t('admin.announcements.errorSamples')}</h2>
          <ul className="mt-3 space-y-2">
            {announcement.error_samples.map((sample) => (
              <li key={`${sample.code}-${sample.message}`} className="rounded-lg bg-white/80 px-3 py-2 text-sm">
                <span className="font-mono text-xs text-red-700">{sample.code}</span>
                <span className="mx-2 text-gray-300">·</span>
                <span className="text-gray-700">{sample.message}</span>
                <span className="ms-2 text-xs text-gray-500">×{sample.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-primary-dark">{t('admin.announcements.messageContent')}</h2>
        <p className="mb-2 text-xs text-gray-500">{t('admin.announcements.pushPreview')}: {announcement.push_preview}</p>
        <AnnouncementHtmlPreview html={sanitizedHtml} />
      </section>
    </div>
  );
}
