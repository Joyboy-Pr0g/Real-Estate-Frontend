'use client';

import { useState } from 'react';
import { Printer, Share2 } from 'lucide-react';
import { SaveButton } from '@/features/listings/components/detail/SaveButton';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ListingTitleBarProps {
  listingId: string;
  title: string;
  isAuthenticated: boolean;
}

export function ListingTitleBar({ listingId, title, isAuthenticated }: ListingTitleBarProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <h1 className="text-xl font-bold text-primary-dark sm:text-2xl">{title}</h1>

      <div className="flex shrink-0 items-center gap-2">
        <SaveButton listingId={listingId} isAuthenticated={isAuthenticated} />
        <button
          type="button"
          onClick={() => window.print()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
          aria-label={t('detail.actions.print')}
        >
          <Printer className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50"
          aria-label={t('detail.actions.share')}
        >
          <Share2 className="h-4 w-4" />
          {copied ? (
            <span className="absolute -bottom-8 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary-dark px-2 py-1 text-[11px] text-white">
              {t('detail.actions.linkCopied')}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
