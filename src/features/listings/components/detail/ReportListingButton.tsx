'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag } from 'lucide-react';
import { ListingReportModal } from '@/features/listings/components/detail/ListingReportModal';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ReportListingButtonProps {
  listingId: string;
  listingTitle: string;
  isAuthenticated: boolean;
  className?: string;
}

export function ReportListingButton({
  listingId,
  listingTitle,
  isAuthenticated,
  className,
}: ReportListingButtonProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600',
          className,
        )}
        aria-label={t('dashboard.report.title')}
        title={t('dashboard.report.title')}
      >
        <Flag className="h-4 w-4" />
      </button>

      <ListingReportModal
        open={open}
        listingId={listingId}
        listingTitle={listingTitle}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
