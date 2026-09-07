import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HomeHeroSection } from '@/features/home/components/HomeHeroSection';
import { FeaturedListings } from '@/features/home/components/FeaturedListings';
import { ExploreCities } from '@/features/home/components/ExploreCities';
import {
  FeaturedListingsSkeleton,
  CitiesCarouselSkeleton,
} from '@/features/shared/components/LoadingSkeletons';
import { HOME_LISTINGS_PER_TYPE } from '@/features/home/constants/home-listings';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { getPageMetadataFromSettings, buildWebSiteSchema } from '@/lib/seo/metadata';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'Find your home in اليمن',
    description: 'ألاف من القوائم من مكاتب العقارات المعتمدة في اليمن.',
    path: '/',
  });
}

export default async function HomePage() {
  const settings = await getWebsiteSettingsServer();
  const websiteSchema = buildWebSiteSchema(settings);

  return (
    <>
      <JsonLdScript data={websiteSchema} />
      <Suspense fallback={<div className="mesh-hero min-h-[420px]" />}>
        <HomeHeroSection />
      </Suspense>
      <Suspense fallback={<FeaturedListingsSkeleton cardsPerSection={HOME_LISTINGS_PER_TYPE} />}>
        <FeaturedListings />
      </Suspense>
      <Suspense fallback={<CitiesCarouselSkeleton />}>
        <ExploreCities />
      </Suspense>
      <ScrollToTopButton />
    </>
  );
}
