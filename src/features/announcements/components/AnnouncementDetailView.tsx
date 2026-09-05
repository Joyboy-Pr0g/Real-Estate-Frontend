'use client';

import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { AnnouncementPublic } from '@/features/admin/types/admin-announcement';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatDateTime } from '@/lib/utils/format';

interface AnnouncementDetailViewProps {
  announcement: AnnouncementPublic;
}

export function AnnouncementDetailView({ announcement }: AnnouncementDetailViewProps) {
  const { t } = useLocale();
  const sanitizedHtml = DOMPurify.sanitize(announcement.body_html);

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/notifications"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('announcements.backToNotifications')}
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">{announcement.title}</h1>
        {announcement.sent_at ? (
          <p className="text-sm text-gray-500">{formatDateTime(announcement.sent_at)}</p>
        ) : null}
      </header>

      <div
        className="prose prose-sm max-w-none rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:prose-base"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </article>
  );
}
