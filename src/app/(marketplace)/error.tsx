'use client';

import { useEffect } from 'react';
import { StatusPage } from '@/features/shared/components/StatusPage';
import { useLocale } from '@/lib/i18n/locale-provider';

interface MarketplaceErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MarketplaceErrorPage({ error, reset }: MarketplaceErrorPageProps) {
  const { t } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

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
