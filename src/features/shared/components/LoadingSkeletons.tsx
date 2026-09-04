import { cn } from '@/lib/utils/cn';

export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('shrink-0 w-[280px] sm:w-[300px]', className)}>
      <div className="aspect-[4/3] rounded-2xl bg-gray-200 animate-pulse mb-3" />
      <div className="space-y-2 px-0.5">
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3.5 w-1/2 bg-gray-100 rounded animate-pulse" />
        <div className="h-3.5 w-2/3 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function CarouselSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="py-14 bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-8" />
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: count }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedListingsSkeleton({ sections = 3, cardsPerSection = 6 }: {
  sections?: number;
  cardsPerSection?: number;
}) {
  return (
    <section className="py-10 md:py-14 bg-surface" aria-busy="true" aria-label="Loading featured listings">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <div className="h-7 md:h-8 w-56 md:w-64 rounded-lg bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-72 max-w-full rounded bg-gray-100 animate-pulse" />
        </div>

        <div className="space-y-10 md:space-y-12">
          {Array.from({ length: sections }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div className="h-6 w-40 rounded-lg bg-gray-200 animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
                  <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
                  <div className="ms-1 h-4 w-16 rounded bg-gray-100 animate-pulse" />
                </div>
              </div>
              <div className="flex gap-5 overflow-hidden pb-2">
                {Array.from({ length: cardsPerSection }).map((__, cardIndex) => (
                  <ListingCardSkeleton key={cardIndex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CitiesCarouselSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="flex gap-3 md:gap-4 overflow-hidden">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[148px] sm:w-[168px] md:w-[180px] aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} className="w-full!" />
      ))}
    </div>
  );
}
