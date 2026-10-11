import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getServerTranslations } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerTranslations();
  return getPageMetadataFromSettings(
    {
      title: t('seo.page.messagingPolicy'),
      description: t('home.seo.metaDescription'),
      path: '/messaging-policy',
    },
    locale,
  );
}

export default function MessagingPolicyPage() {
  return <LegalDocumentPage documentId="messaging-policy" />;
}
