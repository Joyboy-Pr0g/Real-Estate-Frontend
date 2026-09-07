import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'شروط الخدمة',
    description: 'شروط الخدمة التي يتم تطبيقها على الموقع.',
    path: '/terms',
  });
}

export default function TermsPage() {
  return <LegalDocumentPage documentId="terms" />;
}
