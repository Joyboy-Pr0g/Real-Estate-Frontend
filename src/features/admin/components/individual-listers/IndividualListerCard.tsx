'use client';

import { IndividualListerActionsMenu } from '@/features/admin/components/individual-listers/IndividualListerActionsMenu';
import { IndividualListerProfile } from '@/features/individual-lister/types/individual-lister';
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

interface IndividualListerCardProps {
  lister: IndividualListerProfile;
  actionId: string | null;
  onVerify: (lister: IndividualListerProfile) => void;
  onReject: (lister: IndividualListerProfile) => void;
  onSuspend: (lister: IndividualListerProfile) => void;
  onUnsuspend: (lister: IndividualListerProfile) => void;
  onSoftDelete: (lister: IndividualListerProfile) => void;
  onRestore: (lister: IndividualListerProfile) => void;
  onHardDelete: (lister: IndividualListerProfile) => void;
}

export function IndividualListerCard({
  lister,
  actionId,
  onVerify,
  onReject,
  onSuspend,
  onUnsuspend,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: IndividualListerCardProps) {
  const { t } = useLocale();
  const style = lister.deleted_at ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : STATUS_STYLES[lister.verification_status];
  const label = lister.deleted_at
    ? t('admin.status.soft_deleted')
    : t(`dashboard.verification.${lister.verification_status}` as TranslationKey);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-primary-dark">
            {lister.user ? `${lister.user.f_name} ${lister.user.l_name}` : '—'}
          </h3>
          <p className="truncate text-sm text-gray-500">{lister.user?.email ?? '—'}</p>
        </div>
        <IndividualListerActionsMenu
          lister={lister}
          disabled={actionId === lister.id}
          onVerify={() => onVerify(lister)}
          onReject={() => onReject(lister)}
          onSuspend={() => onSuspend(lister)}
          onUnsuspend={() => onUnsuspend(lister)}
          onSoftDelete={() => onSoftDelete(lister)}
          onRestore={() => onRestore(lister)}
          onHardDelete={() => onHardDelete(lister)}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', style)}>{label}</span>
      </div>

      <div className="mt-3 grid gap-1 text-sm text-gray-500">
        <p>{lister.user?.phone_number ?? '—'}</p>
        <p>{formatDateTime(lister.created_at)}</p>
      </div>
    </article>
  );
}
