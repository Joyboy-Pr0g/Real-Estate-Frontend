import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { MyOffice } from '@/features/office/types/office';
import { getServerTranslations } from '@/lib/i18n/server';

interface OfficeUsersListViewProps {
  offices: MyOffice[];
  userId: string;
}

export async function OfficeUsersListView({ offices, userId }: OfficeUsersListViewProps) {
  const { t } = await getServerTranslations();
  const manageable = offices.filter((office) =>
    office.office_users.some((member) => member.user_id === userId && member.role === 'office_admin'),
  );

  if (manageable.length === 0) {
    return <p className="text-gray-500">{t('dashboard.office.noAccess')}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {manageable.map((office) => (
        <Link
          key={office.id}
          href={`/dashboard/office/${office.id}/users`}
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-brand/30"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-primary-dark">{office.name}</p>
            <p className="truncate text-xs text-gray-500">
              {office.office_users.length} {t('admin.officeTeam')}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
