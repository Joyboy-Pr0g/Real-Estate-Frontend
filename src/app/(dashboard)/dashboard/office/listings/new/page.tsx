import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { getMyOffices } from '@/features/office/services/office-service';
import { CreateListingForm } from '@/features/listings/components/dashboard/CreateListingForm';

export default async function NewOfficeListingPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const { t } = await getServerTranslations();
  const [catalog, offices] = await Promise.all([catalogService.getPublicCatalog(), getMyOffices()]);

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.listings.createTitle')}</h1>

      <div className="mt-6">
        <CreateListingForm
          propertyTypes={catalog.propertyTypes}
          transactionTypes={catalog.transactionTypes}
          cities={catalog.cities}
          offices={offices}
          redirectPath="/dashboard/office/listings"
        />
      </div>
    </Container>
  );
}
