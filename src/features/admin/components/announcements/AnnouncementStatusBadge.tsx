'use client';

import type { AnnouncementStatus } from '@/features/admin/types/admin-announcement';
import { announcementStatusBadgeClass, announcementStatusLabel } from '@/features/admin/components/announcements/announcement-display-utils';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface AnnouncementStatusBadgeProps {
  status: AnnouncementStatus;
  className?: string;
}

export function AnnouncementStatusBadge({ status, className }: AnnouncementStatusBadgeProps) {
  const { t } = useLocale();

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        announcementStatusBadgeClass(status),
        className,
      )}
    >
      {announcementStatusLabel(status, t)}
    </span>
  );
}
