import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'سياسة الخصوصية',
    description: 'سياسة الخصوصية التي يتم تطبيقها على الموقع.',
    path: '/privacy',
  });
}

export default function PrivacyPage() {
  return <LegalDocumentPage documentId="privacy" />;
}
