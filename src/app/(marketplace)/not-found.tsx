import { StatusPage } from '@/features/shared/components/StatusPage';
import { getServerTranslations } from '@/lib/i18n/server';

export default async function MarketplaceNotFound() {
  const { t } = await getServerTranslations();

  return (
    <StatusPage
      code="404"
      title={t('error.notFound.title')}
      description={t('error.notFound.description')}
      primaryAction={{ href: '/', label: t('error.backHome') }}
      secondaryAction={{ href: '/listings', label: t('error.browseListings') }}
    />
  );
}
