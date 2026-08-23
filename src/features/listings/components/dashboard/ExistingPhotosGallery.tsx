'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Star, X } from 'lucide-react';
import { toast } from '@/components/ui/toaster';
import { deleteListingImage, setListingMainImage } from '@/features/listings/services/listing-client';
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
  const { t } = useLocale();
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (photos.length === 0) return null;

  const handleRemove = async (publicId: string) => {
    if (photos.length === 1) {
      toast.error(t('dashboard.listings.lastImageError'));
      return;
    }

    setPendingId(publicId);
    try {
      await deleteListingImage(listingId, publicId);
      onPhotosChange(photos.filter((photo) => photo.public_id !== publicId));
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
      onPhotosChange(photos.map((photo) => ({ ...photo, is_main: photo.public_id === publicId })));
      toast.success(t('dashboard.listings.mainImageUpdated'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {photos.map((photo) => (
        <div key={photo.public_id} className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <Image src={photo.url} alt="" fill className="object-cover" sizes="96px" />

          {photo.is_main ? (
            <span className="absolute start-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
              <Star className="h-3.5 w-3.5" fill="currentColor" />
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void handleSetMain(photo.public_id)}
              disabled={pendingId === photo.public_id}
              title={t('dashboard.listings.setMainImage')}
              className="absolute start-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 disabled:opacity-100"
            >
              {pendingId === photo.public_id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Star className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => void handleRemove(photo.public_id)}
            disabled={pendingId === photo.public_id}
            className={cn(
              'absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-red-600',
              pendingId === photo.public_id && 'opacity-50',
            )}
            aria-label={t('admin.remove')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
