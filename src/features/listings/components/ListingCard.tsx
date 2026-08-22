'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, Heart, Star } from 'lucide-react';
import { useState } from 'react';
import { PublicListing } from '@/features/listings/types/listing';
import { formatPriceYER } from '@/lib/utils/currency';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ListingCardProps {
  listing: PublicListing;
}

function isRentListing(listing: PublicListing): boolean {
  const name = listing.transaction_type.name.toLowerCase();
  return name.includes('rent') || name.includes('إيجار') || name.includes('ايجار');
}

function isRecentListing(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const week = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - created < week;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { t } = useLocale();
  const forRent = isRentListing(listing);
  const isNew = isRecentListing(listing.created_at);
  const [saved, setSaved] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const locationLine = t('card.inCity')
    .replace('{type}', listing.property_type.name)
    .replace('{city}', listing.city_name);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((v) => !v);
  };

  return (
    <Link href={`/listings/${listing.slug}`} className="group block">
      <article>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 mb-3">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
          {listing.main_photo ? (
            <Image
              src={listing.main_photo}
              alt={listing.title}
              fill
              className={cn(
                'object-cover transition-transform duration-500 ease-out group-hover:scale-105',
                imgLoaded ? 'opacity-100' : 'opacity-0',
              )}
              sizes="300px"
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <Building2 className="h-14 w-14" strokeWidth={1.25} />
            </div>
          )}

          {/* Badge */}
          {(isNew || listing.status === 'published') && (
            <span className="absolute top-3 start-3 rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-primary-dark shadow-sm">
              {isNew ? t('card.new') : t('card.featured')}
            </span>
          )}

          {/* Save */}
          <motion.button
            type="button"
            onClick={handleSave}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="absolute top-3 end-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm hover:bg-white/90 transition-colors group/save"
            aria-label="Save"
          >
            <Heart
              className={cn(
                'h-[18px] w-[18px] transition-colors',
                saved ? 'fill-secondary text-secondary' : 'text-white group-hover/save:text-primary-dark',
              )}
            />
          </motion.button>

          {/* Transaction pill */}
          <span
            className={cn(
              'absolute bottom-3 start-3 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm',
              forRent ? 'bg-accent-info/90' : 'bg-secondary/90',
            )}
          >
            {forRent ? t('card.forRent') : t('card.forSale')}
          </span>
        </div>

        {/* Meta — Airbnb-style: title row + price row */}
        <div className="space-y-0.5 px-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[15px] text-primary-dark line-clamp-1 leading-snug">
              {listing.neighborhood_name}, {listing.city_name}
            </h3>
            <span className="flex items-center gap-0.5 shrink-0 text-sm text-primary-dark">
              <Star className="h-3.5 w-3.5 fill-primary-dark text-primary-dark" />
              <span className="font-medium">4.9</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-1">{locationLine}</p>
          <p className="text-sm text-gray-500 line-clamp-1 pt-0.5">
            <span className="font-semibold text-primary-dark">{formatPriceYER(listing.price)}</span>
            {' · '}
            {listing.property_subtype.name}
          </p>
        </div>
      </article>
    </Link>
  );
}
