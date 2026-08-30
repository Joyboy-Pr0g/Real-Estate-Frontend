import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { getOfficeDetail, getOfficeAnalytics } from '@/features/office/services/office-service';
import { OfficeProfilePanel } from '@/features/office/components/OfficeProfilePanel';
import { OfficeUsersPanel } from '@/features/office/components/OfficeUsersPanel';
import { OfficeAnalyticsView } from '@/features/office/components/OfficeAnalyticsView';
import { VerificationStatusBanner } from '@/features/dashboard/components/VerificationStatusBanner';
import { OfficeUserRole } from '@/features/office/types/office';
import { getServerTranslations } from '@/lib/i18n/server';

interface OfficeDetailContentProps {
  officeId: string;
  userId: string;
}

export async function OfficeDetailContent({ officeId, userId }: OfficeDetailContentProps) {
  const { t } = await getServerTranslations();
  const office = await getOfficeDetail(officeId);

  if (!office) {
    return <p className="text-gray-500">{t('dashboard.office.noOffice')}</p>;
  }

  const myRole = (office.office_users.find((m) => m.user_id === userId)?.role ?? null) as OfficeUserRole | null;
  const isAdmin = myRole === 'office_admin';

  const [cities, initialNeighborhoods, analytics] = await Promise.all([
    catalogService.getCities(),
    catalogService.getNeighborhoodsByCity(office.city.id),
    getOfficeAnalytics(officeId),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/office"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand"
      >
        <ArrowRight className="h-4 w-4" />
        {t('dashboard.office.backToOffices')}
      </Link>

      {office.verification_status !== 'verified' ? (
        <VerificationStatusBanner
          office_name={office.name}
          status={office.verification_status}
          reason={office.rejected_reason}
        />
      ) : null}

      <OfficeProfilePanel
        office={office}
        myRole={myRole}
        cities={cities}
        initialNeighborhoods={initialNeighborhoods}
      />

      {isAdmin ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-var(--shadow-soft)">
          <h2 className="text-base font-bold text-primary-dark">{t('dashboard.officeUsers')}</h2>
          <div className="mt-4">
            <OfficeUsersPanel officeId={office.id} members={office.office_users} currentUserId={userId} />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-var(--shadow-soft)">
        <h2 className="text-base font-bold text-primary-dark">{t('dashboard.analytics')}</h2>
        <div className="mt-4">
          {analytics ? (
            <OfficeAnalyticsView analytics={analytics} />
          ) : (
            <p className="text-gray-500">{t('dashboard.office.noAnalyticsData')}</p>
          )}
        </div>
      </section>
    </div>
  );
}
