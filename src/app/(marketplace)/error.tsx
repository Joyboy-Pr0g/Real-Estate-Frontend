'use client';

import { StatusPage } from '@/features/shared/components/StatusPage';
import { useLocale } from '@/lib/i18n/locale-provider';

interface MarketplaceErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MarketplaceErrorPage({ reset }: MarketplaceErrorPageProps) {
  const { t } = useLocale();

  return (
    <StatusPage
      code="500"
      title={t('error.server.title')}
      description={t('error.server.description')}
      primaryAction={{ label: t('error.tryAgain'), onClick: reset }}
      secondaryAction={{ href: '/listings', label: t('error.browseListings') }}
    />
  );
}
