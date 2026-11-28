import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getServerTranslations } from '@/lib/i18n/server';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return getPageMetadataFromSettings(
    {
      title: t('seo.page.listingPolicy'),
      description: t('home.seo.metaDescription'),
      path: '/listing-policy',
    },
  );
}

export default function ListingPolicyPage() {
  return <LegalDocumentPage documentId="listing-policy" />;
}
