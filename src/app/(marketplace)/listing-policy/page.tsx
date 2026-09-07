import type { Metadata } from 'next';
import { LegalDocumentPage } from '@/features/legal/components/LegalDocumentPage';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'سياسة القوائم',
    description: 'سياسة القوائم التي يتم تطبيقها على الموقع.',
    path: '/listing-policy',
  });
}

export default function ListingPolicyPage() {
  return <LegalDocumentPage documentId="listing-policy" />;
}
