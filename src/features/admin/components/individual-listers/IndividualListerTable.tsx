'use client';

import Image from 'next/image';
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

interface ListerRowActions {
  actionId: string | null;
  onVerify: (lister: IndividualListerProfile) => void;
  onReject: (lister: IndividualListerProfile) => void;
  onSuspend: (lister: IndividualListerProfile) => void;
  onUnsuspend: (lister: IndividualListerProfile) => void;
  onSoftDelete: (lister: IndividualListerProfile) => void;
  onRestore: (lister: IndividualListerProfile) => void;
  onHardDelete: (lister: IndividualListerProfile) => void;
}

interface IndividualListerTableProps extends ListerRowActions {
  listers: IndividualListerProfile[];
}

function StatusBadge({ lister }: { lister: IndividualListerProfile }) {
  const { t } = useLocale();
  const style = lister.deleted_at ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : STATUS_STYLES[lister.verification_status];
  const label = lister.deleted_at
    ? t('admin.status.soft_deleted')
    : t(`dashboard.verification.${lister.verification_status}` as TranslationKey);

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', style)}>{label}</span>
  );
}

export function IndividualListerTable({
  listers,
  actionId,
  onVerify,
  onReject,
  onSuspend,
  onUnsuspend,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: IndividualListerTableProps) {
  const { t } = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userName')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userEmail')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('auth.phone')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('dashboard.office.doc.id')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userStatus')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userJoined')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {listers.map((lister) => (
              <tr key={lister.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <p className="font-semibold text-primary-dark">
                    {lister.user ? `${lister.user.f_name} ${lister.user.l_name}` : '—'}
                  </p>
                </td>
                <td className="px-5 py-4 text-gray-600">{lister.user?.email ?? '—'}</td>
                <td className="px-5 py-4 text-gray-500">{lister.user?.phone_number ?? '—'}</td>
                <td className="px-5 py-4">
                  <a href={lister.id_photo_url} target="_blank" rel="noreferrer" className="relative block h-10 w-14 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={lister.id_photo_url} alt="" fill className="object-cover" sizes="56px" />
                  </a>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge lister={lister} />
                </td>
                <td className="px-5 py-4 text-gray-500">{formatDateTime(lister.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
