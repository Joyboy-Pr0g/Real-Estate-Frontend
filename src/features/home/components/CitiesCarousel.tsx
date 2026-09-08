'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { buildListingsUrl } from '@/features/listings/lib/build-listings-url';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { CarouselArrow } from '@/features/home/components/CarouselArrow';
import { PublicCity } from '@/features/catalog/types/catalog';
import { getCityGradient } from '@/features/home/constants/city-gradients';
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

interface CitiesCarouselProps {
  cities: PublicCity[];
  title: string;
  subtitle: string;
}

function CityCard({ city, index }: { city: PublicCity; index: number }) {
  const hasPhoto = Boolean(city.city_photo_url);

  return (
    <Link
      href={buildListingsUrl({ cityPcode: city.pcode })}
      className="home-city-card group block snap-start shrink-0 w-[148px] sm:w-[168px] md:w-[180px]"
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'relative aspect-[3/4] overflow-hidden rounded-2xl p-4 flex flex-col justify-end',
          hasPhoto ? 'bg-gray-200' : cn('bg-gradient-to-br', getCityGradient(index)),
        )}
      >
        {hasPhoto ? (
          <Image
            src={city.city_photo_url}
            alt={city.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 148px, (max-width: 768px) 168px, 180px"
          />
        ) : (
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
        )}
        <div
          className={cn(
            'absolute inset-0 transition-colors duration-300',
            hasPhoto
              ? 'bg-gradient-to-t from-black/75 via-black/25 to-black/10 group-hover:from-black/65'
              : 'bg-black/10 group-hover:bg-black/0',
          )}
        />
        <div className="relative min-w-0">
          <p className="text-lg font-bold text-white line-clamp-2 leading-snug">{city.name}</p>
          <p className="text-xs text-white/70 line-clamp-1 mt-0.5">{city.governorate}</p>
        </div>
        <ArrowUpRight className="absolute top-3 end-3 h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
      </motion.div>
    </Link>
  );
}

export function CitiesCarousel({ cities, title, subtitle }: CitiesCarouselProps) {
  const { t, dir } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
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
  }, [cities, dir]);

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

      const cards = scope.querySelectorAll('.home-city-card');
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 24, scale: 0.95 });

        ScrollTrigger.batch(cards, {
          start: SCROLL_START,
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.45,
              stagger: 0.05,
              ease: GSAP_EASE,
              overwrite: true,
            });
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [cities.length] },
  );

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
    <section ref={sectionRef} className="py-12 md:py-16 bg-white">
      <Container>
        <div className="home-section-header flex items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-primary-dark tracking-tight">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
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
        </div>

        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-1 -mx-1 px-1"
        >
          {cities.map((city, index) => (
            <CityCard key={city.id} city={city} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
