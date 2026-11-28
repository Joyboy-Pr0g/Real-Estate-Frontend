import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getServerTranslations } from '@/lib/i18n/server';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return getPageMetadataFromSettings(
    {
      title: t('seo.page.terms'),
      description: t('home.seo.metaDescription'),
      path: '/terms',
    },
  );
}

export default function TermsPage() {
  return <LegalDocumentPage documentId="terms" />;
}
