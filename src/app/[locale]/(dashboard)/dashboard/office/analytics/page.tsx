import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { getMyOffices, getOfficeAnalytics } from '@/features/office/services/office-service';
import { OfficeAnalyticsPanel } from '@/features/office/components/OfficeAnalyticsPanel';
import { OfficeAnalyticsPeriod } from '@/features/office/types/office';

interface OfficeAnalyticsPageProps {
  searchParams: Promise<{ office_id?: string; period?: string; city_id?: string }>;
}

const VALID_PERIODS: OfficeAnalyticsPeriod[] = [
  'this_month',
  'last_three_months',
  'last_six_months',
  'last_year',
  'last_two_years',
];

export default async function OfficeAnalyticsPage({ searchParams }: OfficeAnalyticsPageProps) {
  const user = (await getSession())!;
  if (user.role !== 'office') redirect('/dashboard');

  const { t } = await getServerTranslations();
  const params = await searchParams;
  const [offices, cities] = await Promise.all([getMyOffices(), catalogService.getCities()]);
  const verifiedOffices = offices.filter((office) => office.verification_status === 'verified');
  const officeId = params.office_id ?? verifiedOffices[0]?.id;
  const period = VALID_PERIODS.includes(params.period as OfficeAnalyticsPeriod)
    ? (params.period as OfficeAnalyticsPeriod)
    : 'this_month';
  const cityId = params.city_id;

  const analytics = officeId ? await getOfficeAnalytics(officeId, period, cityId) : null;

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.office.analyticsTitle')}</h1>
      <p className="mt-1 text-sm text-gray-500">{t('dashboard.office.analyticsHint')}</p>
      <div className="mt-6">
        <OfficeAnalyticsPanel
          offices={verifiedOffices}
          cities={cities}
          analytics={analytics}
          officeId={officeId}
          period={period}
          cityId={cityId}
        />
      </div>
    </Container>
  );
}
