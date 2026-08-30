'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { useState } from 'react';
import { PublicListing } from '@/features/listings/types/listing';
import { formatPriceYER } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';

interface MapListingCardProps {
  listing: PublicListing;
  compact?: boolean;
}

export function MapListingCard({ listing, compact = false }: MapListingCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className={cn(
        'group flex gap-3 rounded-xl border border-gray-100 bg-white p-2.5 transition-shadow hover:shadow-md',
        compact && 'p-2',
      )}
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {!loaded ? <div className="absolute inset-0 animate-pulse bg-gray-200" /> : null}
        {listing.main_photo ? (
          <Image
            src={listing.main_photo}
            alt={listing.title}
            fill
            loading="lazy"
            className={cn('object-cover', loaded ? 'opacity-100' : 'opacity-0')}
            sizes="96px"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <Building2 className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-semibold text-primary-dark">{listing.title}</p>
        <p className="text-xs font-semibold text-brand-dark">{formatPriceYER(listing.price)}</p>
        <p className="line-clamp-1 text-xs text-gray-500">
          {listing.property_type.name} · {listing.property_subtype.name} · {listing.transaction_type.display_name_ar}
        </p>
        <p className="line-clamp-1 text-xs text-gray-400">
          {listing.neighborhood_name}, {listing.city_name}
        </p>
      </div>
    </Link>
  );
}
