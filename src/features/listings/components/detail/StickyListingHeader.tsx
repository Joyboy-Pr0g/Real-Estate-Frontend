'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Image from 'next/image';
import { Banknote, Building2, MapPin, Phone, User } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { useSiteHeaderOverride } from '@/features/layout/context/site-header-override';
import { SaveButton } from '@/features/listings/components/detail/SaveButton';
import { getSpecIcon } from '@/features/listings/lib/spec-icon-map';
import {
  formatSpecDisplayValue,
  getHighlightSpecKeys,
  getSpecFieldLabel,
} from '@/features/listings/lib/property-spec-display';
import { YerVariant } from '@/features/listings/types/listing';
import { PublicListingSeller, ListingPropertySpecs } from '@/features/listings/types/listing-detail';
import { PropertySpecSchema } from '@/features/catalog/types/property-subtype';
import { formatPriceYER } from '@/lib/utils/currency';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

/** Approximate sticky bar height used by the scroll sentinel (mobile bar is taller). */
const STICKY_BAR_OFFSET_PX = 88;

interface StickyListingHeaderProps {
  listingPhoto: string | undefined;
  listingId: string;
  listingSlug: string;
  title: string;
  price: string;
  yerVariant: YerVariant;
  cityName: string;
  neighborhoodName: string;
  specs: ListingPropertySpecs;
  specSchema?: PropertySpecSchema | null;
  seller: PublicListingSeller;
  isAuthenticated: boolean;
  initialSaved?: boolean;
}

function ListingThumb({
  src,
  alt,
  fallback,
  className,
}: {
  src?: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200', className)}>
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="36px" />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-300">{fallback}</div>
      )}
    </div>
  );
}

function CondensedBar({
  listingPhoto,
  listingId,
  listingSlug,
  title,
  price,
  yerVariant,
  cityName,
  neighborhoodName,
  specs,
  specSchema,
  seller,
  isAuthenticated,
  initialSaved = false,
}: StickyListingHeaderProps) {
  const isOffice = seller.type === 'office';
  const { t } = useLocale();
  const highlights = getHighlightSpecKeys(specs, specSchema);
  const booleanLabels = { yes: t('detail.specs.yes'), no: t('detail.specs.no') };
  const formattedPrice = formatPriceYER(price, yerVariant);
  const locationLabel = `${neighborhoodName}, ${cityName}`;

  return (
    <div className="border-b border-gray-200/60 bg-white/85 shadow-[0_12px_28px_-8px_rgba(15,23,42,0.25)] backdrop-blur-md">
      <Container>
        {/* Mobile */}
        <div className="flex flex-col gap-2 py-2.5 sm:hidden">
          <div className="flex items-center gap-2.5">
            <ListingThumb
              src={listingPhoto}
              alt={title}
              className="h-9 w-9"
              fallback={<Building2 className="h-4 w-4" />}
            />
            <p className="min-w-0 flex-1 truncate text-sm font-bold leading-snug text-primary-dark">{title}</p>
            <SaveButton
              listingId={listingId}
              listingSlug={listingSlug}
              isAuthenticated={isAuthenticated}
              initialSaved={initialSaved}
            />
          </div>

          <div className="flex items-center gap-2 ps-11.5">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="flex items-center gap-1 truncate text-sm font-bold text-brand-dark">
                <Banknote className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
                <span className="truncate">{formattedPrice}</span>
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                <MapPin className="h-3 w-3 shrink-0 text-gray-400" aria-hidden />
                <span className="truncate">{locationLabel}</span>
              </p>
            </div>
            <a
              href={`tel:${seller.phone_number}`}
              aria-label={seller.phone_number}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand transition-colors hover:bg-brand hover:text-white"
            >
              <Phone className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>

        {/* Desktop / tablet */}
        <div className="hidden min-h-17 items-center justify-between gap-4 py-3 sm:flex">
          <ListingThumb
            src={listingPhoto}
            alt={title}
            className="h-9 w-9"
            fallback={<Building2 className="h-4 w-4" />}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p className="truncate text-sm font-bold text-primary-dark">{title}</p>
              <SaveButton
                listingId={listingId}
                listingSlug={listingSlug}
                isAuthenticated={isAuthenticated}
                initialSaved={initialSaved}
              />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 font-bold text-brand-dark">
                <Banknote className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                {formattedPrice}
              </span>
              <span className="flex min-w-0 items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <span className="truncate">{locationLabel}</span>
              </span>
              {highlights.map((key) => {
                const Icon = getSpecIcon(key);
                const label = getSpecFieldLabel(key, specSchema);
                const value = formatSpecDisplayValue(key, specs[key], specSchema, booleanLabels);

                return (
                  <span key={key} className="hidden items-center gap-1.5 font-medium lg:flex" title={label}>
                    <Icon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                    {label}: <span className="font-medium">{value}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-1.5">
            <ListingThumb
              src={isOffice ? seller.photo_url : undefined}
              alt={seller.name}
              className="h-9 w-9"
              fallback={isOffice ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
            />
            <div className="min-w-0">
              <p className="max-w-36 truncate text-xs font-bold text-primary-dark md:max-w-48">{seller.name}</p>
              <a
                href={`tel:${seller.phone_number}`}
                className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-brand-dark"
                dir="ltr"
              >
                <Phone className="h-2.5 w-2.5" aria-hidden />
                {seller.phone_number}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export function StickyListingHeader(props: StickyListingHeaderProps) {
  const { setOverride } = useSiteHeaderOverride();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const scrolledPast = entry.boundingClientRect.top < STICKY_BAR_OFFSET_PX;
        setOverride(<CondensedBar {...props} />, scrolledPast);
      },
      { rootMargin: `-${STICKY_BAR_OFFSET_PX}px 0px 0px 0px` },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setOverride(null, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title, props.price, props.yerVariant, props.cityName, props.neighborhoodName, props.specs, props.specSchema, props.seller.id, props.isAuthenticated]);

  return <div ref={sentinelRef} className="h-px" />;
}
