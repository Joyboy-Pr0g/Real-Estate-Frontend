'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2, Star, X } from 'lucide-react';
import { toast } from '@/components/ui/toaster';
import {
  deleteListingImage,
  setListingImagesOrder,
  setListingMainImage,
} from '@/features/listings/services/listing-client';
import { buildImagesOrderPayload, sortPhotosByOrder } from '@/features/listings/lib/listing-image-meta';
import { ListingDetailPhoto } from '@/features/listings/types/listing-detail';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ExistingPhotosGalleryProps {
  listingId: string;
  photos: ListingDetailPhoto[];
  onPhotosChange: (photos: ListingDetailPhoto[]) => void;
}

export function ExistingPhotosGallery({ listingId, photos, onPhotosChange }: ExistingPhotosGalleryProps) {
  const { t, dir } = useLocale();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sortedPhotos = useMemo(() => sortPhotosByOrder(photos), [photos]);

  if (sortedPhotos.length === 0) return null;

  const persistOrder = async (nextPhotos: ListingDetailPhoto[]) => {
    await setListingImagesOrder(listingId, buildImagesOrderPayload(nextPhotos));
    onPhotosChange(nextPhotos.map((photo, index) => ({ ...photo, order: index })));
    toast.success(t('dashboard.listings.imagesOrderUpdated'));
  };

  const handleRemove = async (publicId: string) => {
    if (sortedPhotos.length === 1) {
      toast.error(t('dashboard.listings.lastImageError'));
      return;
    }

    setPendingId(publicId);
    try {
      await deleteListingImage(listingId, publicId);
      const next = sortedPhotos.filter((photo) => photo.public_id !== publicId);
      onPhotosChange(next.map((photo, index) => ({ ...photo, order: index })));
      toast.success(t('dashboard.listings.imageRemoved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  const handleSetMain = async (publicId: string) => {
    setPendingId(publicId);
    try {
      await setListingMainImage(listingId, publicId);
      onPhotosChange(
        sortedPhotos.map((photo) => ({ ...photo, is_main: photo.public_id === publicId })),
      );
      toast.success(t('dashboard.listings.mainImageUpdated'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  const movePhoto = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sortedPhotos.length) return;

    const next = [...sortedPhotos];
    [next[index], next[target]] = [next[target], next[index]];

    setPendingId(next[target].public_id);
    try {
      await persistOrder(next);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{t('dashboard.listings.existingImagesOrderHint')}</p>

      <div className="flex flex-wrap gap-3">
        {sortedPhotos.map((photo, index) => {
          const busy = pendingId === photo.public_id;

          return (
            <div
              key={photo.public_id}
              className={cn(
                'relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-2 ring-transparent',
                photo.is_main && 'ring-brand',
              )}
            >
              <Image src={photo.url} alt="" fill className="object-cover" sizes="112px" />

              <span className="absolute start-1 top-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {index + 1}
              </span>

              <button
                type="button"
                onClick={() => void handleSetMain(photo.public_id)}
                disabled={busy}
                title={t('dashboard.listings.setMainImage')}
                className={cn(
                  'absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                  photo.is_main ? 'bg-brand text-white' : 'bg-black/50 text-white hover:bg-black/70',
                )}
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Star className="h-3.5 w-3.5" fill={photo.is_main ? 'currentColor' : 'none'} />
                )}
              </button>

              <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => void movePhoto(index, -1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white disabled:opacity-30"
                  aria-label={t('dashboard.listings.moveImageEarlier')}
                >
                  <ChevronLeft className={cn('h-3.5 w-3.5', dir === 'rtl' && 'rotate-180')} />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleRemove(photo.public_id)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white hover:bg-red-600 disabled:opacity-50"
                  aria-label={t('admin.remove')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={busy || index === sortedPhotos.length - 1}
                  onClick={() => void movePhoto(index, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white disabled:opacity-30"
                  aria-label={t('dashboard.listings.moveImageLater')}
                >
                  <ChevronRight className={cn('h-3.5 w-3.5', dir === 'rtl' && 'rotate-180')} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
