'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { fetchListingPhotos } from '@/features/listings/services/listing-client';
import type { ListingDetailPhoto } from '@/features/listings/types/listing-detail';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getErrorMessage } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

interface ListingImagePickerModalProps {
  open: boolean;
  listingId: string;
  onClose: () => void;
  onSelectPhoto: (photo: { url: string; public_id: string }) => void;
}

export function ListingImagePickerModal({
  open,
  listingId,
  onClose,
  onSelectPhoto,
}: ListingImagePickerModalProps) {
  const { t } = useLocale();
  const [photos, setPhotos] = useState<ListingDetailPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPhotos([]);

    void (async () => {
      try {
        const items = await fetchListingPhotos(listingId);
        if (cancelled) return;
        setPhotos(items);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, listingId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="text-base font-bold text-primary-dark">{t('dashboard.messages.pickImage')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label={t('admin.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('dashboard.messages.listingPhotos')}
          </p>

          {loading ? <p className="text-sm text-gray-500">{t('dashboard.messages.loadingPhotos')}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {!loading && !error && photos.length === 0 ? (
            <p className="text-sm text-gray-500">{t('dashboard.messages.noListingPhotos')}</p>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <button
                key={photo.public_id}
                type="button"
                onClick={() => {
                  onSelectPhoto({ url: photo.url, public_id: photo.public_id });
                  onClose();
                }}
                className={cn('relative aspect-square overflow-hidden rounded-xl bg-gray-100 hover:ring-2 hover:ring-brand')}
              >
                <Image src={photo.url} alt="" fill className="object-cover" sizes="120px" />
                {photo.is_main ? (
                  <span className="absolute start-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    ★
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
