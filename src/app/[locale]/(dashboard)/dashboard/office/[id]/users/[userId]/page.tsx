import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { getOfficeDetail } from '@/features/office/services/office-service';
import { getOfficeUserActionLogs } from '@/features/office/services/office-user-action-logs-service';
import { OfficeUserActionLogsPanel } from '@/features/office/components/OfficeUserActionLogsPanel';
import { getServerTranslations } from '@/lib/i18n/server';

interface OfficeUserActionLogsPageProps {
  params: Promise<{ id: string; userId: string }>;
}

export default async function OfficeUserActionLogsPage({ params }: OfficeUserActionLogsPageProps) {
  const user = (await getSession())!;
  const { id: officeId, userId } = await params;
  const { t } = await getServerTranslations();

  const office = await getOfficeDetail(officeId);
  if (!office) notFound();

  const myRole = office.office_users.find((m) => m.user_id === user.id)?.role ?? null;
  if (myRole !== 'office_admin') {
    return (
      <Container className="py-8">
        <p className="text-gray-500">{t('dashboard.office.noAccess')}</p>
      </Container>
    );
  }

  const member = office.office_users.find((m) => m.user_id === userId);
  if (!member) notFound();

  const logs = await getOfficeUserActionLogs(officeId, userId);

  return (
    <Container className="py-8">
      <OfficeUserActionLogsPanel officeId={officeId} member={member} initialLogs={logs} />
    </Container>
  );
}
