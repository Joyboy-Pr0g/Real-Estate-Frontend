import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getServerTranslations } from '@/lib/i18n/server';
import { Container } from '@/components/ui/container';
import { MyListingsContent } from '@/features/listings/components/dashboard/MyListingsContent';

interface MyListingsPageProps {
  searchParams: Promise<{
    status?: string;
    property_type_id?: string;
    property_subtype_id?: string;
    transaction_type_id?: string;
    city_id?: string;
    neighborhood_id?: string;
  }>;
}

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  const user = await getSession();
  if (!user) redirect('/login');

  const { t } = await getServerTranslations();

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold text-primary-dark">{t('dashboard.listings')}</h1>

      <div className="mt-6">
        <MyListingsContent searchParams={searchParams} basePath="/dashboard/listings" />
      </div>
    </Container>
  );
}
