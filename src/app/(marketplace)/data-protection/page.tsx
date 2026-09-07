import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'سياسة الحماية البيانات',
    description: 'سياسة الحماية البيانات التي يتم تطبيقها على الموقع.',
    path: '/data-protection',
  });
}

export default function DataProtectionPage() {
  return <LegalDocumentPage documentId="data-protection" />;
}
