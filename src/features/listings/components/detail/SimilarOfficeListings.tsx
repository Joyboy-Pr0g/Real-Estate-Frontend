'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselArrow } from '@/features/home/components/CarouselArrow';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { PublicListing } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';

interface SimilarOfficeListingsProps {
  officeName: string;
  listings: PublicListing[];
  isAuthenticated?: boolean;
  savedIds?: string[];
}

export function SimilarOfficeListings({
  officeName,
  listings,
  isAuthenticated = false,
  savedIds = [],
}: SimilarOfficeListingsProps) {
  const savedSet = new Set(savedIds);
  const { t, dir } = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth - 4;

    if (dir === 'rtl') {
      setCanPrev(scrollLeft < -4);
      setCanNext(Math.abs(scrollLeft) < max);
    } else {
      setCanPrev(scrollLeft > 4);
      setCanNext(scrollLeft < max);
    }
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, dir]);

  const scroll = (direction: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    const sign = dir === 'rtl' ? (direction === 'next' ? -1 : 1) : direction === 'next' ? 1 : -1;
    el.scrollBy({ left: sign * amount, behavior: 'smooth' });
    setTimeout(updateArrows, 350);
  };

  if (listings.length === 0) return null;

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-lg font-bold text-primary-dark">
          {t('detail.similar.title').replace('{office}', officeName)}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <CarouselArrow onClick={() => scroll('prev')} disabled={!canPrev} label={t('carousel.prev')} icon={PrevIcon} />
          <CarouselArrow onClick={() => scroll('next')} disabled={!canNext} label={t('carousel.next')} icon={NextIcon} />
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 -mx-1 px-1"
      >
        {listings.map((listing) => (
          <div key={listing.id} className="snap-start shrink-0 w-[280px] sm:w-[300px]">
            <ListingCard
              listing={listing}
              isAuthenticated={isAuthenticated}
              initialSaved={savedSet.has(listing.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
