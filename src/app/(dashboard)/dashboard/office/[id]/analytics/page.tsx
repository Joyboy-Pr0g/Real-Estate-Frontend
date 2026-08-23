import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { OfficeAnalyticsContent } from '@/features/office/components/OfficeAnalyticsContent';

interface OfficeAnalyticsDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OfficeAnalyticsDetailPage({ params }: OfficeAnalyticsDetailPageProps) {
  const user = await getSession();
  if (!user) redirect('/login');

  const { id } = await params;
  const { t } = await getServerTranslations();

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.analytics')}</h1>

      <div className="mt-6">
        <OfficeAnalyticsContent officeId={id} />
      </div>
    </Container>
  );
}
