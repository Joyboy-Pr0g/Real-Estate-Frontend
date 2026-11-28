'use client';

import { StatusPage } from '@/features/shared/components/StatusPage';
import { useLocale } from '@/lib/i18n/locale-provider';

export default function NotFound() {
  const { t } = useLocale();

  return (
    <StatusPage
      code="404"
      title={t('error.notFound.title')}
      description={t('error.notFound.description')}
      showChrome
      primaryAction={{ href: '/', label: t('error.backHome') }}
      secondaryAction={{ href: '/listings', label: t('error.browseListings') }}
    />
  );
}
