import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { getMyOffices, getOfficeUserAnalytics } from '@/features/office/services/office-service';
import { OfficeUsersAnalyticsPanel } from '@/features/office/components/OfficeUsersAnalyticsPanel';
import { OfficeAnalyticsPeriod } from '@/features/office/types/office';

interface OfficeUsersPageProps {
  searchParams: Promise<{ office_id?: string; period?: string }>;
}

const VALID_PERIODS: OfficeAnalyticsPeriod[] = [
  'this_month',
  'last_three_months',
  'last_six_months',
  'last_year',
  'last_two_years',
];

export default async function OfficeUsersPage({ searchParams }: OfficeUsersPageProps) {
  const user = await getSession();
  if (!user) redirect('/login');
  if (user.role !== 'office') redirect('/dashboard');

  const { t } = await getServerTranslations();
  const params = await searchParams;
  const offices = (await getMyOffices()).filter((office) => office.verification_status === 'verified');
  const officeId = params.office_id ?? offices[0]?.id;
  const period = VALID_PERIODS.includes(params.period as OfficeAnalyticsPeriod)
    ? (params.period as OfficeAnalyticsPeriod)
    : 'this_month';

  const analytics = officeId ? await getOfficeUserAnalytics(officeId, period) : null;

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.office.userAnalyticsTitle')}</h1>
      <p className="mt-1 text-sm text-gray-500">{t('dashboard.office.userAnalyticsHint')}</p>
      <div className="mt-6">
        <OfficeUsersAnalyticsPanel offices={offices} analytics={analytics} officeId={officeId} period={period} />
      </div>
    </Container>
  );
}
