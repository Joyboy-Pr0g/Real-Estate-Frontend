'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Maximize,
  Minus,
  Plus,
  PlayCircle,
  X,
} from 'lucide-react';
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

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

function LightboxViewer({
  title,
  photos,
  initialIndex,
  onClose,
}: {
  title: string;
  photos: ListingDetailPhoto[];
  initialIndex: number;
  onClose: () => void;
}) {
  const { t, dir } = useLocale();
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const goTo = (next: number) => {
    setIndex((next + photos.length) % photos.length);
    setZoom(1);
  };

  const goPrev = () => goTo(index + (dir === 'rtl' ? 1 : -1));
  const goNext = () => goTo(index + (dir === 'rtl' ? -1 : 1));

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') (dir === 'rtl' ? goNext : goPrev)();
      else if (e.key === 'ArrowRight') (dir === 'rtl' ? goPrev : goNext)();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, dir]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.0015)));
  };

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const photo = photos[index];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95">
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-medium">
          {t('detail.gallery.counter').replace('{current}', String(index + 1)).replace('{total}', String(photos.length))}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            aria-label={t('detail.gallery.zoomOut')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            aria-label={t('detail.gallery.zoomIn')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('detail.gallery.close')}
            className="ms-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4">
        <div className="absolute inset-y-0 start-2 z-10 flex items-center">
          <CarouselArrow onClick={goPrev} disabled={photos.length < 2} label={t('carousel.prev')} icon={PrevIcon} />
        </div>

        <div
          onWheel={handleWheel}
          className="flex h-full w-full items-center justify-center overflow-auto no-scrollbar"
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.url}
              alt={title}
              style={{ transform: `scale(${zoom})` }}
              className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
              draggable={false}
            />
          ) : null}
        </div>

        <div className="absolute inset-y-0 end-2 z-10 flex items-center">
          <CarouselArrow onClick={goNext} disabled={photos.length < 2} label={t('carousel.next')} icon={NextIcon} />
        </div>
      </div>
    </div>
  );
}

export function ListingGallery({ title, photos, videoUrl, videoThumbnail }: ListingGalleryProps) {
  const { t, dir } = useLocale();
  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order);
  const [mode, setMode] = useState<ViewMode>('photos');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
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
    <div className="overflow-hidden rounded-2xl bg-white shadow-(--shadow-soft) ring-1 ring-gray-100">
      <div className="relative aspect-16/10 w-full bg-gray-100">
        {mode === 'photos' ? (
          activePhoto ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute inset-0 cursor-zoom-in"
              aria-label={t('detail.gallery.allPhotos')}
            >
              <Image
                src={activePhoto.url}
                alt={title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </button>
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
          <>
            <span className="pointer-events-none absolute bottom-3 inset-e-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
              {t('detail.gallery.counter')
                .replace('{current}', String(activeIndex + 1))
                .replace('{total}', String(sortedPhotos.length))}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-3 inset-s-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-black/75"
            >
              <Maximize className="h-3.5 w-3.5" />
              {t('detail.gallery.allPhotos')}
            </button>
          </>
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

      {lightboxOpen && sortedPhotos.length > 0 ? (
        <LightboxViewer
          title={title}
          photos={sortedPhotos}
          initialIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </div>
  );
}
