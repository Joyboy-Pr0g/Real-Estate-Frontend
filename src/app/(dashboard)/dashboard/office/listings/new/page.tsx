import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { getMyOffices } from '@/features/office/services/office-service';
import { CreateListingForm } from '@/features/listings/components/dashboard/CreateListingForm';
import { ListingCreationBlocked } from '@/features/listings/components/dashboard/ListingCreationBlocked';
import { VerificationStatusBanner } from '@/features/dashboard/components/VerificationStatusBanner';

export default async function NewOfficeListingPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const { t } = await getServerTranslations();
  const [catalog, offices] = await Promise.all([catalogService.getPublicCatalog(), getMyOffices()]);
  const verifiedOffices = offices.filter((office) => office.verification_status === 'verified');
  const canCreate = verifiedOffices.length > 0;
  const hasUnverifiedOnly = offices.length > 0 && verifiedOffices.length === 0;
  const statusOffice = offices[0] ?? null;

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.listings.createTitle')}</h1>

      <div className="mt-6">
        {statusOffice && statusOffice.verification_status !== 'verified' ? (
          <VerificationStatusBanner
            office_name={statusOffice.name}
            status={statusOffice.verification_status}
            reason={statusOffice.rejected_reason}
          />
        ) : null}

        {offices.length === 0 || !canCreate ? (
          <ListingCreationBlocked
            status={hasUnverifiedOnly ? (statusOffice?.verification_status ?? 'pending') : 'pending'}
            reason={statusOffice?.rejected_reason}
            backHref="/dashboard/office/listings"
          />
        ) : (
          <CreateListingForm
            propertyTypes={catalog.propertyTypes}
            transactionTypes={catalog.transactionTypes}
            cities={catalog.cities}
            offices={verifiedOffices}
            redirectPath="/dashboard/office/listings"
          />
        )}
      </div>
    </Container>
  );
}
