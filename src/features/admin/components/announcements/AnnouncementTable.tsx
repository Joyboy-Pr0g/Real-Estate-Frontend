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

interface AnnouncementTableProps {
  items: AnnouncementListItem[];
}

export function AnnouncementTable({ items }: AnnouncementTableProps) {
  const { t } = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-var(--shadow-soft) lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.announcements.colTitle')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.announcements.colStatus')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.announcements.colAudience')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.announcements.colSentBy')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.announcements.colSentAt')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.announcements.colReadRate')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/announcements/campaigns/${item.id}`}
                    className="font-semibold text-primary-dark hover:text-brand-dark"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {item.in_app_created_count > 0
                      ? `${item.in_app_created_count} ${t('admin.announcements.metricInApp').toLowerCase()}`
                      : t(`admin.announcements.audience.${item.audience}` as const)}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <AnnouncementStatusBadge status={item.status} />
                </td>
                <td className="px-5 py-4 text-gray-600">{announcementAudienceLabel(item.audience, t)}</td>
                <td className="px-5 py-4 text-gray-600">{announcementSenderLabel(item)}</td>
                <td className="px-5 py-4 text-gray-500">{formatAnnouncementSentLabel(item, t)}</td>
                <td className="px-5 py-4 tabular-nums text-gray-700">{formatAnnouncementReadRate(item)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/announcements/campaigns/${item.id}`}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-muted"
                    >
                      {t('admin.announcements.viewCampaign')}
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
