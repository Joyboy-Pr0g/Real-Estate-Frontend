'use client';

import { useEffect, useRef } from 'react';
import { Container } from '@/components/ui/container';
import { useSiteHeaderOverride } from '@/features/layout/context/site-header-override';
import { ListingPropertySpecs } from '@/features/listings/types/listing-detail';
import { formatPriceYER } from '@/lib/utils/currency';

interface StickyListingHeaderProps {
  title: string;
  price: string;
  cityName: string;
  neighborhoodName: string;
  specs: ListingPropertySpecs;
}

const HIGHLIGHT_SPEC_KEYS = ['bedrooms_count', 'area_sqm', 'floor_number'];

function CondensedBar({ title, price, cityName, neighborhoodName, specs }: StickyListingHeaderProps) {
  const highlights = HIGHLIGHT_SPEC_KEYS.filter((key) => specs[key] !== undefined);

  return (
    <Container>
      <div className="flex h-[68px] items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-primary-dark">{title}</p>
          <p className="truncate text-xs text-gray-500">
            {neighborhoodName}, {cityName}
            {highlights.length > 0 ? ' · ' : ''}
            {highlights.map((key) => String(specs[key])).join(' · ')}
          </p>
        </div>
        <p className="shrink-0 text-sm font-bold text-brand-dark">{formatPriceYER(price)}</p>
      </div>
    </Container>
  );
}

export function StickyListingHeader(props: StickyListingHeaderProps) {
  const { setOverride } = useSiteHeaderOverride();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // isIntersecting alone can't tell "not yet scrolled down to the
        // sentinel" (below the viewport) apart from "scrolled past it"
        // (above the viewport) — both report isIntersecting: false. Only
        // the second case should hide the header, so gate on the sentinel's
        // actual position relative to the sticky header's height (68px).
        const scrolledPast = entry.boundingClientRect.top < 68;
        setOverride(<CondensedBar {...props} />, scrolledPast);
      },
      { rootMargin: '-68px 0px 0px 0px' },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setOverride(null, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title, props.price, props.cityName, props.neighborhoodName]);

  return <div ref={sentinelRef} className="h-px" />;
}
