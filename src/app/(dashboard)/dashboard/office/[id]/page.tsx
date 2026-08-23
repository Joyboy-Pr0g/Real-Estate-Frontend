import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { OfficeProfileContent } from '@/features/office/components/OfficeProfileContent';

interface OfficeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OfficeDetailPage({ params }: OfficeDetailPageProps) {
  const user = await getSession();
  if (!user) redirect('/login');

  const { id } = await params;
  const { t } = await getServerTranslations();

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.office')}</h1>

      <div className="mt-6">
        <OfficeProfileContent officeId={id} userId={user.id} />
      </div>
    </Container>
  );
}
