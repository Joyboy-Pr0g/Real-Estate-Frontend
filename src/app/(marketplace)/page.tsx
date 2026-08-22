import { Suspense } from 'react';
import { HomeHeroSection } from '@/features/home/components/HomeHeroSection';
import { FeaturedListings } from '@/features/home/components/FeaturedListings';
import { ExploreCities } from '@/features/home/components/ExploreCities';
import {
  CarouselSkeleton,
  CitiesCarouselSkeleton,
} from '@/features/shared/components/LoadingSkeletons';

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="mesh-hero min-h-[420px]" />}>
        <HomeHeroSection />
      </Suspense>
      <Suspense fallback={<CarouselSkeleton />}>
        <FeaturedListings />
      </Suspense>
      <Suspense fallback={<CitiesCarouselSkeleton />}>
        <ExploreCities />
      </Suspense>
    </>
  );
}
