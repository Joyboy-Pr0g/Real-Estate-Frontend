'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { buildListingsUrl } from '@/features/listings/lib/build-listings-url';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { CarouselArrow } from '@/features/home/components/CarouselArrow';
import { HomePropertyTypeSection } from '@/features/home/types/home-listings';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import {
  ensureGsapPlugins,
  gsap,
  GSAP_EASE,
  prefersReducedMotion,
  SCROLL_START,
  ScrollTrigger,
} from '@/lib/motion/gsap-config';

interface ListingsCarouselProps {
  sections: HomePropertyTypeSection[];
  title: string;
  subtitle?: string;
  viewAllLabel?: string;
  isAuthenticated?: boolean;
  savedIds?: string[];
}

function TypeListingsRow({
  section,
  viewAllLabel,
}: {
  section: HomePropertyTypeSection;
  viewAllLabel: string;
}) {
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
  }, [section.listings, dir]);

  const scroll = (direction: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    const sign =
      dir === 'rtl'
        ? direction === 'next'
          ? -1
          : 1
        : direction === 'next'
          ? 1
          : -1;
    el.scrollBy({ left: sign * amount, behavior: 'smooth' });
    setTimeout(updateArrows, 350);
  };

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="home-listing-row space-y-4">
      <div className="home-listing-row-header flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-primary-dark tracking-tight">
            {section.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <CarouselArrow
              onClick={() => scroll('prev')}
              disabled={!canPrev}
              label={t('carousel.prev')}
              icon={PrevIcon}
            />
            <CarouselArrow
              onClick={() => scroll('next')}
              disabled={!canNext}
              label={t('carousel.next')}
              icon={NextIcon}
            />
          </div>
          <Link
            href={buildListingsUrl({ propertyTypeSlug: section.slug })}
            className="text-sm font-semibold text-primary-dark underline-offset-4 hover:underline ms-1"
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 -mx-1 px-1"
      >
        {section.listings.map((listing) => (
          <div key={listing.id} className="home-listing-card snap-start shrink-0 w-[280px] sm:w-[300px]">
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListingsCarousel({
  sections,
  title,
  subtitle,
  viewAllLabel,
}: ListingsCarouselProps) {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const visibleSections = sections.filter((section) => section.listings.length > 0);
  const resolvedViewAllLabel = viewAllLabel ?? t('featured.viewAll');

  useGSAP(
    () => {
      ensureGsapPlugins();
      const scope = sectionRef.current;
      if (!scope || prefersReducedMotion()) return;

      const header = scope.querySelector('.home-section-header');
      if (header) {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: SCROLL_START,
            once: true,
          },
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: GSAP_EASE,
        });
      }

      const rowHeaders = scope.querySelectorAll('.home-listing-row-header');
      rowHeaders.forEach((rowHeader) => {
        gsap.from(rowHeader, {
          scrollTrigger: {
            trigger: rowHeader,
            start: SCROLL_START,
            once: true,
          },
          y: 20,
          opacity: 0,
          duration: 0.45,
          ease: GSAP_EASE,
        });
      });

      const cards = scope.querySelectorAll('.home-listing-card');
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 28 });

        ScrollTrigger.batch(cards, {
          start: SCROLL_START,
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.45,
              stagger: 0.06,
              ease: GSAP_EASE,
              overwrite: true,
            });
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [visibleSections.length] },
  );

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-10 md:py-14 bg-surface">
      <Container>
        <div className="home-section-header mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-semibold text-primary-dark tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>

        <div className={cn('space-y-10 md:space-y-12')}>
          {visibleSections.map((section) => (
            <TypeListingsRow
              key={section.id}
              section={section}
              viewAllLabel={resolvedViewAllLabel}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
