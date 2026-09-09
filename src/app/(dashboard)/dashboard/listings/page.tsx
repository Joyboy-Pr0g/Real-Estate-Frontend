import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { getMyIndividualListerProfile } from '@/features/individual-lister/services/individual-lister-service';
import { MyListingsContent } from '@/features/listings/components/dashboard/MyListingsContent';
import { VerificationStatusBanner } from '@/features/dashboard/components/VerificationStatusBanner';

interface MyListingsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    property_type_id?: string;
    property_subtype_id?: string;
    transaction_type_id?: string;
    city_id?: string;
    neighborhood_id?: string;
  }>;
}

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  const { t } = await getServerTranslations();
  const individualProfile = await getMyIndividualListerProfile();

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.listings')}</h1>

      <div className="mt-6">
        {individualProfile && individualProfile.verification_status !== 'verified' ? (
          <VerificationStatusBanner
            status={individualProfile.verification_status}
            reason={individualProfile.rejected_reason}
          />
        ) : null}

        <MyListingsContent searchParams={searchParams} basePath="/dashboard/listings" />
      </div>
    </Container>
  );
}
