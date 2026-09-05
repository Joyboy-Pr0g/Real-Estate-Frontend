'use client';

import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { SupportTicketStatus } from '@/features/support-tickets/types/support-ticket';
import { formatTicketStatusKey } from '@/features/support-tickets/components/support-ticket-utils';

const STATUS_STYLES: Record<SupportTicketStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  resolved: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  closed: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

export function SupportTicketStatusBadge({ status }: { status: SupportTicketStatus }) {
  const { t } = useLocale();

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[status])}>
      {t(formatTicketStatusKey(status))}
    </span>
  );
}
