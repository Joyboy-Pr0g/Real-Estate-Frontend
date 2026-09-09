import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { getMyIndividualListerProfile } from '@/features/individual-lister/services/individual-lister-service';
import { getMyOffices } from '@/features/office/services/office-service';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { BecomeAListerPanel } from '@/features/dashboard/components/BecomeAListerPanel';

export default async function BecomeAListerPage() {
  const user = (await getSession())!;
  if (user.role === 'office') redirect('/dashboard/office');

  const { t } = await getServerTranslations();
  const [individualProfile, offices, cities] = await Promise.all([
    getMyIndividualListerProfile(),
    getMyOffices(),
    catalogService.getCities(),
  ]);

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.becomeALister')}</h1>
      <BecomeAListerPanel individualProfile={individualProfile} offices={offices} cities={cities} />
    </Container>
  );
}
