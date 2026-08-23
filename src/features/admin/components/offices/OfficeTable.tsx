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

interface OfficeRowActions {
  actionId: string | null;
  onVerify: (office: OfficeDetail) => void;
  onReject: (office: OfficeDetail) => void;
  onSuspend: (office: OfficeDetail) => void;
  onUnsuspend: (office: OfficeDetail) => void;
  onSoftDelete: (office: OfficeDetail) => void;
  onRestore: (office: OfficeDetail) => void;
  onHardDelete: (office: OfficeDetail) => void;
}

interface OfficeTableProps extends OfficeRowActions {
  offices: OfficeDetail[];
}

function StatusBadge({ office }: { office: OfficeDetail }) {
  const { t } = useLocale();
  const style = office.deleted_at
    ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
    : STATUS_STYLES[office.verification_status];
  const label = office.deleted_at
    ? t('admin.status.soft_deleted')
    : t(`dashboard.verification.${office.verification_status}` as TranslationKey);

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', style)}>
      {label}
    </span>
  );
}

export function OfficeTable({
  offices,
  actionId,
  onVerify,
  onReject,
  onSuspend,
  onUnsuspend,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: OfficeTableProps) {
  const { t } = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">{t('dashboard.office.name')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('dashboard.emailLabel')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('auth.phone')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userStatus')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.userJoined')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {offices.map((office) => (
              <tr key={office.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <Link href={`/admin/offices/${office.id}`} className="font-semibold text-primary-dark hover:underline">
                    {office.name}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {office.city.name}, {office.neighborhood.name}
                  </p>
                </td>
                <td className="px-5 py-4 text-gray-600">{office.email}</td>
                <td className="px-5 py-4 text-gray-500">{office.phone_number}</td>
                <td className="px-5 py-4">
                  <StatusBadge office={office} />
                </td>
                <td className="px-5 py-4 text-gray-500">{formatDateTime(office.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
