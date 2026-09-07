import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'سياسة الرسائل',
    description: 'سياسة الرسائل التي يتم تطبيقها على الموقع.',
    path: '/messaging-policy',
  });
}

export default function MessagingPolicyPage() {
  return <LegalDocumentPage documentId="messaging-policy" />;
}
