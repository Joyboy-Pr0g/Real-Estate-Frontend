import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'سياسة الكوكيز',
    description: 'سياسة الكوكيز التي يتم تطبيقها على الموقع.',
    path: '/cookies',
  });
}

export default function CookiesPage() {
  return <LegalDocumentPage documentId="cookies" />;
}
