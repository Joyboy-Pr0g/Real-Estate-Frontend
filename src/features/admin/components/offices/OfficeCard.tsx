'use client';

import Link from 'next/link';
import { OfficeActionsMenu } from '@/features/admin/components/offices/OfficeActionsMenu';
import { OfficeDetail } from '@/features/office/types/office';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  verified: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  suspended: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

interface OfficeCardProps {
  office: OfficeDetail;
  actionId: string | null;
  onVerify: (office: OfficeDetail) => void;
  onReject: (office: OfficeDetail) => void;
  onSuspend: (office: OfficeDetail) => void;
  onUnsuspend: (office: OfficeDetail) => void;
  onSoftDelete: (office: OfficeDetail) => void;
  onRestore: (office: OfficeDetail) => void;
  onHardDelete: (office: OfficeDetail) => void;
}

export function OfficeCard({
  office,
  actionId,
  onVerify,
  onReject,
  onSuspend,
  onUnsuspend,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: OfficeCardProps) {
  const { t } = useLocale();
  const style = office.deleted_at ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : STATUS_STYLES[office.verification_status];
  const label = office.deleted_at
    ? t('admin.status.soft_deleted')
    : t(`dashboard.verification.${office.verification_status}` as TranslationKey);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/admin/offices/${office.id}`} className="block truncate font-semibold text-primary-dark hover:underline">
            {office.name}
          </Link>
          <p className="truncate text-sm text-gray-500">{office.email}</p>
        </div>
        <OfficeActionsMenu
          office={office}
          disabled={actionId === office.id}
          onVerify={() => onVerify(office)}
          onReject={() => onReject(office)}
          onSuspend={() => onSuspend(office)}
          onUnsuspend={() => onUnsuspend(office)}
          onSoftDelete={() => onSoftDelete(office)}
          onRestore={() => onRestore(office)}
          onHardDelete={() => onHardDelete(office)}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', style)}>
          {label}
        </span>
      </div>

      <div className="mt-3 grid gap-1 text-sm text-gray-500">
        <p>{office.phone_number}</p>
        <p>{office.city.name}, {office.neighborhood.name}</p>
        <p>{formatDateTime(office.created_at)}</p>
      </div>
    </article>
  );
}
