'use client';

import { useEffect, useRef } from 'react';
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
import { PublicListingSeller, ListingPropertySpecs } from '@/features/listings/types/listing-detail';
import { PropertySpecSchema } from '@/features/catalog/types/property-subtype';
import { formatPriceYER } from '@/lib/utils/currency';
import { useLocale } from '@/lib/i18n/locale-provider';

interface StickyListingHeaderProps {
  listingId: string;
  listingSlug: string;
  title: string;
  price: string;
  cityName: string;
  neighborhoodName: string;
  specs: ListingPropertySpecs;
  specSchema?: PropertySpecSchema | null;
  seller: PublicListingSeller;
  isAuthenticated: boolean;
  initialSaved?: boolean;
}

function CondensedBar({
  listingId,
  listingSlug,
  title,
  price,
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

  return (
    <div className="border-b border-gray-200/60 bg-white/85 shadow-[0_12px_28px_-8px_rgba(15,23,42,0.25)] backdrop-blur-md">
      <Container>
        <div className="flex h-17 items-center justify-between gap-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p className="truncate text-sm font-bold text-primary-dark">{title}</p>
              <SaveButton listingId={listingId} listingSlug={listingSlug} isAuthenticated={isAuthenticated} initialSaved={initialSaved} />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5 font-bold text-brand-dark">
                <Banknote className="h-4 w-4 shrink-0 text-brand" />
                {formatPriceYER(price)}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                {neighborhoodName}, {cityName}
              </span>
              {highlights.map((key) => {
                const Icon = getSpecIcon(key);
                const label = getSpecFieldLabel(key, specSchema);
                const value = formatSpecDisplayValue(key, specs[key], specSchema, booleanLabels);

                return (
                  <span
                    key={key}
                    className="flex items-center gap-1.5 font-medium"
                    title={label}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                    {value}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-1.5 sm:flex">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
              {isOffice && seller.photo_url ? (
                <Image src={seller.photo_url} alt={seller.name} fill className="object-cover" sizes="36px" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  {isOffice ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-primary-dark">{seller.name}</p>
              <a
                href={`tel:${seller.phone_number}`}
                className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-brand-dark"
                dir="ltr"
              >
                <Phone className="h-2.5 w-2.5" />
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
        // isIntersecting alone can't tell "not yet scrolled down to the
        // sentinel" (below the viewport) apart from "scrolled past it"
        // (above the viewport) — both report isIntersecting: false. Only
        // the second case should hide the header, so gate on the sentinel's
        // actual position relative to the sticky header's height (68px).
        const scrolledPast = entry.boundingClientRect.top < 68;
        setOverride(<CondensedBar {...props} />, scrolledPast);
      },
      { rootMargin: '-68px 0px 0px 0px' },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setOverride(null, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title, props.price, props.cityName, props.neighborhoodName, props.specs, props.specSchema, props.seller.id, props.isAuthenticated]);

  return <div ref={sentinelRef} className="h-px" />;
}
