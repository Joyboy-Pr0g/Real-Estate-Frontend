'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { PublicListing } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';

interface RemovableListingGridProps {
  listings: PublicListing[];
  onRemove: (listingId: string) => Promise<void>;
  savedIds?: string[];
}

export function RemovableListingGrid({ listings, onRemove, savedIds = [] }: RemovableListingGridProps) {
  const { t } = useLocale();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRemoving, setBulkRemoving] = useState(false);
  const savedSet = new Set(savedIds);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await onRemove(id);
      setSelected((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } finally {
      setRemovingId(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkRemove = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    setBulkRemoving(true);
    try {
      await Promise.all(ids.map((id) => onRemove(id)));
      setSelected(new Set());
    } finally {
      setBulkRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      {selected.size > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
          <p className="text-sm font-medium text-primary-dark">
            {t('dashboard.selectedCount').replace('{count}', String(selected.size))}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm text-gray-500 hover:text-primary-dark"
            >
              {t('dashboard.clearSelection')}
            </button>
            <button
              type="button"
              onClick={() => void handleBulkRemove()}
              disabled={bulkRemoving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {bulkRemoving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {t('dashboard.removeSelected')}
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {listings.map((listing) => (
          <div key={listing.id}>
            <ListingCard listing={listing} />
            <div className="mt-2 flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <input
                  type="checkbox"
                  checked={selected.has(listing.id)}
                  onChange={() => toggleSelected(listing.id)}
                  className="h-3.5 w-3.5 accent-brand"
                />
                {t('dashboard.select')}
              </label>
              <button
                type="button"
                onClick={() => void handleRemove(listing.id)}
                disabled={removingId === listing.id}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 disabled:opacity-60"
              >
                {removingId === listing.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
                {t('admin.remove')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
