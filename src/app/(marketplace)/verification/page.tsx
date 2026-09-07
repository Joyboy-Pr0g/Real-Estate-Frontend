import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'سياسة التحقق',
    description: 'سياسة التحقق التي يتم تطبيقها على الموقع.',
    path: '/verification',
  });
}

export default function VerificationPage() {
  return <LegalDocumentPage documentId="verification" />;
}
