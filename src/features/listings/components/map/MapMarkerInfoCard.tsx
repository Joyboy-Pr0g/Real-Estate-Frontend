'use client';

import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { useState } from 'react';
import { PublicListing } from '@/features/listings/types/listing';
import { formatPriceYER } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';

interface MapMarkerInfoCardProps {
  listing: PublicListing;
  className?: string;
}

export function MapMarkerInfoCard({ listing, className }: MapMarkerInfoCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        'flex w-[min(18rem,calc(100vw-2rem))] gap-2.5 rounded-xl border border-gray-100 bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.14)]',
        className,
      )}
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {!loaded ? <div className="absolute inset-0 animate-pulse bg-gray-200" /> : null}
        {listing.main_photo ? (
          <Image
            src={listing.main_photo}
            alt={listing.title}
            fill
            loading="lazy"
            className={cn('object-cover', loaded ? 'opacity-100' : 'opacity-0')}
            sizes="80px"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <Building2 className="h-7 w-7" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5 py-0.5">
        <p className="line-clamp-1 text-sm font-semibold text-primary-dark">{listing.title}</p>
        <p className="text-sm font-bold text-brand-dark">{formatPriceYER(listing.price)}</p>
        <p className="line-clamp-1 text-xs text-gray-500">
          {listing.property_type.name} · {listing.property_subtype.name}
        </p>
        <p className="line-clamp-1 text-xs text-gray-400">{listing.transaction_type.display_name_ar}</p>
      </div>
    </div>
  );
}
