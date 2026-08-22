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
