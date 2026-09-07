import { Suspense } from 'react';
import type { Metadata } from 'next';
import { OfficesContent } from '@/features/office/components/public/OfficesContent';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getOfficesCanonicalPath } from '@/lib/seo/indexing';

interface OfficesPageProps {
  searchParams: Promise<{
    cityId?: string;
    neighborhoodId?: string;
    search?: string;
    cursor?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'مكاتب العقارات المعتمدة',
    description: 'تصفح مكاتب العقارات المعتمدة في اليمن واستكشف القوائم المنشورة بواسطتها.',
    path: getOfficesCanonicalPath(),
  });
}

export default function OfficesPage({ searchParams }: OfficesPageProps) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-7xl animate-pulse rounded-2xl bg-gray-100 px-4 py-10" />}>
      <OfficesContent searchParams={searchParams} />
    </Suspense>
  );
}
