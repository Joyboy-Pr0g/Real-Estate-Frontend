'use client';

import { useState } from 'react';
import { Film, Loader2, X } from 'lucide-react';
import { toast } from '@/components/ui/toaster';
import { deleteListingVideo } from '@/features/listings/services/listing-client';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ExistingVideoPreviewProps {
  listingId: string;
  videoUrl: string;
  videoPublicId: string;
  onRemoved: () => void;
}

export function ExistingVideoPreview({ listingId, videoUrl, videoPublicId, onRemoved }: ExistingVideoPreviewProps) {
  const { t } = useLocale();
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await deleteListingVideo(listingId, videoPublicId);
      onRemoved();
      toast.success(t('dashboard.listings.videoRemoved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
        <Film className="h-4 w-4" />
      </span>
      <a href={videoUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm text-brand-dark hover:underline">
        {t('dashboard.listings.video')}
      </a>
      <button
        type="button"
        onClick={() => void handleRemove()}
        disabled={removing}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
        aria-label={t('admin.remove')}
      >
        {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      </button>
    </div>
  );
}
