import { Suspense } from 'react';
import { HomeHeroSection } from '@/features/home/components/HomeHeroSection';
import { FeaturedListings } from '@/features/home/components/FeaturedListings';
import { ExploreCities } from '@/features/home/components/ExploreCities';
import {
  FeaturedListingsSkeleton,
  CitiesCarouselSkeleton,
} from '@/features/shared/components/LoadingSkeletons';
import { HOME_LISTINGS_PER_TYPE } from '@/features/home/constants/home-listings';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';

export const revalidate = 300;

export default function HomePage() {
  return (
    <>
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
