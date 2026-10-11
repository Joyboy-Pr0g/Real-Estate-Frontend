'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Banknote, Building2 } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { useSiteHeaderOverride } from '@/features/layout/context/site-header-override';
import { SaveButton } from '@/features/listings/components/detail/SaveButton';
import { MessageListingButton } from '@/features/listings/components/detail/MessageListingButton';
import { YerVariant } from '@/features/listings/types/listing';
import { formatPrice } from '@/lib/utils/currency';
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
  isAuthenticated: boolean;
  canStartMessage: boolean;
  initialSaved?: boolean;
}

function CondensedBar({
  listingPhoto,
  listingId,
  listingSlug,
  title,
  price,
  yerVariant,
  isAuthenticated,
  canStartMessage,
  initialSaved = false,
}: StickyListingHeaderProps) {
  const formattedPrice = formatPrice(price, yerVariant);

  return (
    <div className="border-b border-gray-200/60 bg-white/85 shadow-[0_12px_28px_-8px_rgba(15,23,42,0.25)] backdrop-blur-md">
      <Container>
        <div className="flex items-center gap-3 py-2.5 sm:py-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
            {listingPhoto ? (
              <Image src={listingPhoto} alt={title} fill className="object-cover" sizes="36px" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <Building2 className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-primary-dark">{title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-brand-dark">
              <Banknote className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
              <span className="truncate">{formattedPrice}</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <SaveButton
              listingId={listingId}
              listingSlug={listingSlug}
              isAuthenticated={isAuthenticated}
              initialSaved={initialSaved}
            />
            <MessageListingButton
              listingId={listingId}
              listingSlug={listingSlug}
              isAuthenticated={isAuthenticated}
              canStartMessage={canStartMessage}
              variant="icon"
            />
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
  }, [
    props.title,
    props.price,
    props.yerVariant,
    props.isAuthenticated,
    props.canStartMessage,
    props.listingId,
    props.listingSlug,
  ]);

  return <div ref={sentinelRef} className={cn('h-px')} />;
}
