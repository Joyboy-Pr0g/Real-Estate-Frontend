import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HomeHeroSection } from '@/features/home/components/HomeHeroSection';
// import { HomeSeoContent } from '@/features/home/components/HomeSeoContent';
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
import { getServerTranslations } from '@/lib/i18n/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerTranslations();

  return getPageMetadataFromSettings(
    {
      title: t('hero.title'),
      description: t('home.seo.metaDescription'),
      path: '/',
    },
    locale,
  );
}

export default async function HomePage() {
  const settings = await getWebsiteSettingsServer();
  const websiteSchema = buildWebSiteSchema(settings);

  return (
    <>
      <JsonLdScript data={websiteSchema} />
      <HomeHeroSection />
      <Suspense fallback={<FeaturedListingsSkeleton cardsPerSection={HOME_LISTINGS_PER_TYPE} />}>
        <FeaturedListings />
      </Suspense>
      <Suspense fallback={<CitiesCarouselSkeleton />}>
        <ExploreCities />
      </Suspense>
      {/* <HomeSeoContent /> */}
      <ScrollToTopButton />
    </>
  );
}
