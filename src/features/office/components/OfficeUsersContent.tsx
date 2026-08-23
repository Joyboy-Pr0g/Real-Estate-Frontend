import { getOfficeDetail } from '@/features/office/services/office-service';
import { OfficeUsersPanel } from '@/features/office/components/OfficeUsersPanel';
import { getServerTranslations } from '@/lib/i18n/server';

interface OfficeUsersContentProps {
  officeId: string;
  userId: string;
}

export async function OfficeUsersContent({ officeId, userId }: OfficeUsersContentProps) {
  const { t } = await getServerTranslations();
  const office = await getOfficeDetail(officeId);

  if (!office) {
    return <p className="text-gray-500">{t('dashboard.office.noOffice')}</p>;
  }

  const myRole = office.office_users.find((m) => m.user_id === userId)?.role ?? null;

  if (myRole !== 'office_admin') {
    return <p className="text-gray-500">{t('dashboard.office.noAccess')}</p>;
  }

  return <OfficeUsersPanel officeId={office.id} members={office.office_users} currentUserId={userId} />;
}
