'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { AnnouncementListItem } from '@/features/admin/types/admin-announcement';
import { AnnouncementStatusBadge } from '@/features/admin/components/announcements/AnnouncementStatusBadge';
import {
  announcementAudienceLabel,
  announcementSenderLabel,
  formatAnnouncementReadRate,
  formatAnnouncementSentLabel,
} from '@/features/admin/components/announcements/announcement-display-utils';
import { useLocale } from '@/lib/i18n/locale-provider';

interface AnnouncementCardProps {
  item: AnnouncementListItem;
}

export function AnnouncementCard({ item }: AnnouncementCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-var(--shadow-soft)">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/announcements/campaigns/${item.id}`}
            className="truncate font-semibold text-primary-dark hover:text-brand-dark"
          >
            {item.title}
          </Link>
          <p className="mt-0.5 text-sm text-gray-500">{announcementSenderLabel(item)}</p>
        </div>
        <Link
          href={`/admin/announcements/campaigns/${item.id}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-muted"
          aria-label={t('admin.announcements.viewCampaign')}
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <AnnouncementStatusBadge status={item.status} />
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {announcementAudienceLabel(item.audience, t)}
        </span>
      </div>

      <div className="mt-3 grid gap-1 text-sm text-gray-500">
        <p>{formatAnnouncementSentLabel(item, t)}</p>
        <p>
          {t('admin.announcements.colReadRate')}: {formatAnnouncementReadRate(item)}
        </p>
        {item.in_app_created_count > 0 ? (
          <p>
            {t('admin.announcements.metricInApp')}: {item.in_app_created_count}
          </p>
        ) : null}
      </div>
    </article>
  );
}
