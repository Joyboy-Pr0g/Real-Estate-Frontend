import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { getMyOffices } from '@/features/office/services/office-service';
import { MyOfficesPanel } from '@/features/office/components/MyOfficesPanel';

export default async function OfficePage() {
  const user = (await getSession())!;

  const { t } = await getServerTranslations();
  const [offices, cities] = await Promise.all([getMyOffices(), catalogService.getCities()]);

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.office')}</h1>

      <div className="mt-6">
        <MyOfficesPanel offices={offices} userId={user.id} cities={cities} />
      </div>
    </Container>
  );
}
