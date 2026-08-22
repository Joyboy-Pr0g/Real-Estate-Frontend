'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Building2, ChevronLeft, ChevronRight, ImageIcon, PlayCircle } from 'lucide-react';
import { CarouselArrow } from '@/features/home/components/CarouselArrow';
import { ListingDetailPhoto } from '@/features/listings/types/listing-detail';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ListingGalleryProps {
  title: string;
  photos: ListingDetailPhoto[];
  videoUrl: string | null;
  videoThumbnail: string | null;
}

type ViewMode = 'photos' | 'video';

export function ListingGallery({ title, photos, videoUrl, videoThumbnail }: ListingGalleryProps) {
  const { t, dir } = useLocale();
  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order);
  const [mode, setMode] = useState<ViewMode>('photos');
  const [activeIndex, setActiveIndex] = useState(0);
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
  }, [sortedPhotos.length, dir]);

  const scroll = (direction: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    const sign = dir === 'rtl' ? (direction === 'next' ? -1 : 1) : direction === 'next' ? 1 : -1;
    el.scrollBy({ left: sign * amount, behavior: 'smooth' });
    setTimeout(updateArrows, 350);
  };

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const activePhoto = sortedPhotos[activeIndex];

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] ring-1 ring-gray-100">
      <div className="relative aspect-[16/10] w-full bg-gray-100">
        {mode === 'photos' ? (
          activePhoto ? (
            <Image
              src={activePhoto.url}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <Building2 className="h-16 w-16" strokeWidth={1.25} />
            </div>
          )
        ) : (
          <video
            key={videoUrl ?? undefined}
            src={videoUrl ?? undefined}
            poster={videoThumbnail ?? undefined}
            controls
            className="h-full w-full object-cover"
          />
        )}

        {mode === 'photos' && sortedPhotos.length > 0 ? (
          <span className="absolute bottom-3 end-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {t('detail.gallery.counter')
              .replace('{current}', String(activeIndex + 1))
              .replace('{total}', String(sortedPhotos.length))}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1 border-b border-gray-100 px-3 py-1">
        <button
          type="button"
          onClick={() => setMode('photos')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors',
            mode === 'photos' ? 'text-brand-dark' : 'text-gray-500 hover:text-primary-dark',
          )}
        >
          <ImageIcon className="h-4 w-4" />
          {t('detail.gallery.photosTab')}
        </button>
        {videoUrl ? (
          <button
            type="button"
            onClick={() => setMode('video')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors',
              mode === 'video' ? 'text-brand-dark' : 'text-gray-500 hover:text-primary-dark',
            )}
          >
            <PlayCircle className="h-4 w-4" />
            {t('detail.gallery.videoTab')}
          </button>
        ) : null}
      </div>

      {mode === 'photos' && sortedPhotos.length > 0 ? (
        <div className="flex items-center gap-2 p-3">
          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="flex flex-1 gap-2 overflow-x-auto no-scrollbar scroll-smooth"
          >
            {sortedPhotos.map((photo, i) => (
              <button
                key={photo.url + i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition-all',
                  i === activeIndex ? 'ring-brand' : 'ring-transparent opacity-80 hover:opacity-100',
                )}
              >
                <Image src={photo.url} alt="" fill className="object-cover" sizes="96px" />
              </button>
            ))}
          </div>
          <div className="flex shrink-0 gap-1.5">
            <CarouselArrow onClick={() => scroll('prev')} disabled={!canPrev} label={t('carousel.prev')} icon={PrevIcon} />
            <CarouselArrow onClick={() => scroll('next')} disabled={!canNext} label={t('carousel.next')} icon={NextIcon} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
