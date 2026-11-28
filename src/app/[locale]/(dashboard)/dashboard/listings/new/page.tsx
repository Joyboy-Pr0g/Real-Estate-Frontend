import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { featureService } from '@/features/catalog/services/feature-service';
import { getMyIndividualListerProfile } from '@/features/individual-lister/services/individual-lister-service';
import { CreateListingForm } from '@/features/listings/components/dashboard/CreateListingForm';
import { ListingCreationBlocked } from '@/features/listings/components/dashboard/ListingCreationBlocked';
import { VerificationStatusBanner } from '@/features/dashboard/components/VerificationStatusBanner';

export default async function NewListingPage() {
  const { t } = await getServerTranslations();
  const [catalog, individualProfile, mainFeatures] = await Promise.all([
    catalogService.getPublicCatalog(),
    getMyIndividualListerProfile(),
    featureService.getMainFeatures(),
  ]);

  const canCreate = individualProfile?.verification_status === 'verified';

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.listings.createTitle')}</h1>

      <div className="mt-6">
        {individualProfile && individualProfile.verification_status !== 'verified' ? (
          <VerificationStatusBanner
            status={individualProfile.verification_status}
            reason={individualProfile.rejected_reason}
          />
        ) : null}

        {!individualProfile ? (
          <ListingCreationBlocked status="pending" backHref="/dashboard/become-a-lister" />
        ) : !canCreate ? (
          <ListingCreationBlocked
            status={individualProfile.verification_status}
            reason={individualProfile.rejected_reason}
            backHref="/dashboard/listings"
          />
        ) : (
          <CreateListingForm
            propertyTypes={catalog.propertyTypes}
            transactionTypes={catalog.transactionTypes}
            cities={catalog.cities}
            mainFeatures={mainFeatures}
          />
        )}
      </div>
    </Container>
  );
}
