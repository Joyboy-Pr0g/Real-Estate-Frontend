'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Star, X } from 'lucide-react';
import {
  createListingImageDraft,
  type ListingImageDraft,
} from '@/features/listings/lib/listing-image-meta';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ImageGalleryInputProps {
  images: ListingImageDraft[];
  mainImageId: string | null;
  onImagesChange: (images: ListingImageDraft[]) => void;
  onMainImageChange: (id: string) => void;
}

export function ImageGalleryInput({
  images,
  mainImageId,
  onImagesChange,
  onMainImageChange,
}: ImageGalleryInputProps) {
  const { t, dir } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(
    () => images.map((item) => URL.createObjectURL(item.file)),
    [images],
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const resolvedMainId = mainImageId ?? images[0]?.id ?? null;

  const handleAdd = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added = Array.from(files).map(createListingImageDraft);
    const next = [...images, ...added];
    onImagesChange(next);
    if (!resolvedMainId && next[0]) {
      onMainImageChange(next[0].id);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    const next = images.filter((item) => item.id !== id);
    onImagesChange(next);
    if (resolvedMainId === id) {
      onMainImageChange(next[0]?.id ?? '');
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onImagesChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{t('dashboard.listings.imagesOrderHint')}</p>

      <div className="flex flex-wrap gap-3">
        {images.map((item, index) => {
          const isMain = item.id === resolvedMainId;

          return (
            <div
              key={item.id}
              className={cn(
                'relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-2 ring-transparent',
                isMain && 'ring-brand',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={previews[index]} alt={item.file.name} className="h-full w-full object-cover" />

              <span className="absolute start-1 top-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {index + 1}
              </span>

              <button
                type="button"
                onClick={() => onMainImageChange(item.id)}
                title={t('dashboard.listings.setMainImage')}
                className={cn(
                  'absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                  isMain ? 'bg-brand text-white' : 'bg-black/50 text-white hover:bg-black/70',
                )}
              >
                <Star className="h-3.5 w-3.5" fill={isMain ? 'currentColor' : 'none'} />
              </button>

              <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveImage(index, -1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white disabled:opacity-30"
                  aria-label={t('dashboard.listings.moveImageEarlier')}
                >
                  <ChevronLeft className={cn('h-3.5 w-3.5', dir === 'rtl' && 'rotate-180')} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white hover:bg-red-600"
                  aria-label={t('admin.remove')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => moveImage(index, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white disabled:opacity-30"
                  aria-label={t('dashboard.listings.moveImageLater')}
                >
                  <ChevronRight className={cn('h-3.5 w-3.5', dir === 'rtl' && 'rotate-180')} />
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-brand/40 hover:text-brand"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-xs font-medium">{t('dashboard.listings.addImages')}</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleAdd(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  );
}
