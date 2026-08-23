import { getOfficeAnalytics } from '@/features/office/services/office-service';
import { OfficeAnalyticsView } from '@/features/office/components/OfficeAnalyticsView';
import { getServerTranslations } from '@/lib/i18n/server';

interface OfficeAnalyticsContentProps {
  officeId: string;
}

export async function OfficeAnalyticsContent({ officeId }: OfficeAnalyticsContentProps) {
  const { t } = await getServerTranslations();
  const analytics = await getOfficeAnalytics(officeId);

  if (!analytics) {
    return <p className="text-gray-500">{t('dashboard.office.noAnalyticsData')}</p>;
  }

  return <OfficeAnalyticsView analytics={analytics} />;
}
