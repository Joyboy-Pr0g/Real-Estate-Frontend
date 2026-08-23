import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { getMyOffices } from '@/features/office/services/office-service';
import { OfficeAnalyticsContent } from '@/features/office/components/OfficeAnalyticsContent';
import { OfficesListView } from '@/features/office/components/OfficesListView';

export default async function OfficeAnalyticsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const { t } = await getServerTranslations();
  const offices = await getMyOffices();

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.analytics')}</h1>

      <div className="mt-6">
        {offices.length === 0 ? (
          <p className="text-gray-500">{t('dashboard.office.noOffice')}</p>
        ) : offices.length > 1 ? (
          <OfficesListView offices={offices} hrefSuffix="/analytics" />
        ) : (
          <OfficeAnalyticsContent officeId={offices[0].id} />
        )}
      </div>
    </Container>
  );
}
