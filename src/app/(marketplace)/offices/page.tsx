import { Suspense } from 'react';
import type { Metadata } from 'next';
import { OfficesContent } from '@/features/office/components/public/OfficesContent';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getOfficesCanonicalPath } from '@/lib/seo/indexing';
import { getServerTranslations } from '@/lib/i18n/server';

interface OfficesPageProps {
  searchParams: Promise<{
    cityId?: string;
    neighborhoodId?: string;
    search?: string;
    cursor?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerTranslations();
  return getPageMetadataFromSettings(
    {
      title: t('seo.page.offices'),
      description: t('home.seo.metaDescription'),
      path: getOfficesCanonicalPath(),
    },
    locale,
  );
}

export default function OfficesPage({ searchParams }: OfficesPageProps) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-7xl animate-pulse rounded-2xl bg-gray-100 px-4 py-10" />}>
      <OfficesContent searchParams={searchParams} />
    </Suspense>
  );
}
