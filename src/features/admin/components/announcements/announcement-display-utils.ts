import type { AnnouncementAudience, AnnouncementListItem, AnnouncementStatus } from '@/features/admin/types/admin-announcement';
import type { TranslationKey } from '@/lib/i18n/ar';
import { formatDateTime } from '@/lib/utils/format';

export function announcementStatusBadgeClass(status: AnnouncementStatus): string {
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

export function formatAnnouncementSentLabel(
  item: Pick<AnnouncementListItem, 'sent_at' | 'scheduled_at'>,
  t: (key: TranslationKey) => string,
): string {
  if (item.sent_at) return formatDateTime(item.sent_at);
  if (item.scheduled_at) {
    return `${t('admin.announcements.scheduledFor')} ${formatDateTime(item.scheduled_at)}`;
  }
  return '—';
}

export function formatAnnouncementReadRate(
  item: Pick<AnnouncementListItem, 'status' | 'read_rate'>,
): string {
  if (item.status === 'sent' || item.status === 'sending') {
    return `${item.read_rate}%`;
  }
  return '—';
}

export function announcementAudienceLabel(
  audience: AnnouncementAudience,
  t: (key: TranslationKey) => string,
): string {
  return t(`admin.announcements.audience.${audience}` as TranslationKey);
}

export function announcementStatusLabel(
  status: AnnouncementStatus,
  t: (key: TranslationKey) => string,
): string {
  return t(`admin.announcements.status.${status}` as TranslationKey);
}

export function announcementSenderLabel(item: Pick<AnnouncementListItem, 'created_by_admin_name' | 'created_by_admin_id'>): string {
  return item.created_by_admin_name || item.created_by_admin_id.slice(0, 8);
}
