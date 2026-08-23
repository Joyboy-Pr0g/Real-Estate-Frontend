import { catalogService } from '@/features/catalog/services/catalog-service';
import { getOfficeDetail } from '@/features/office/services/office-service';
import { OfficeProfilePanel } from '@/features/office/components/OfficeProfilePanel';
import { OfficeUserRole } from '@/features/office/types/office';
import { getServerTranslations } from '@/lib/i18n/server';

interface OfficeProfileContentProps {
  officeId: string;
  userId: string;
}

export async function OfficeProfileContent({ officeId, userId }: OfficeProfileContentProps) {
  const { t } = await getServerTranslations();
  const office = await getOfficeDetail(officeId);

  if (!office) {
    return <p className="text-gray-500">{t('dashboard.office.noOffice')}</p>;
  }

  const myRole = (office.office_users.find((m) => m.user_id === userId)?.role ?? null) as OfficeUserRole | null;

  const [cities, initialNeighborhoods] = await Promise.all([
    catalogService.getCities(),
    catalogService.getNeighborhoodsByCity(office.city.id),
  ]);

  return (
    <OfficeProfilePanel office={office} myRole={myRole} cities={cities} initialNeighborhoods={initialNeighborhoods} />
  );
}
