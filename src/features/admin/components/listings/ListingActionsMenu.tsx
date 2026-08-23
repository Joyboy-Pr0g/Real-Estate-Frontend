'use client';

import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminListingSummary } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ListingActionsMenuProps {
  listing: AdminListingSummary;
  disabled?: boolean;
  onDraft: () => void;
  onSoftDelete: () => void;
  onRestore: () => void;
  onHardDelete: () => void;
}

export function ListingActionsMenu({
  listing,
  disabled = false,
  onDraft,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: ListingActionsMenuProps) {
  const { t } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-primary-dark disabled:opacity-50"
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {!listing.deleted_at ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/admin/listings/${listing.id}`} className="cursor-pointer">
                {t('admin.viewDetails')}
              </Link>
            </DropdownMenuItem>

            {listing.status === 'published' ? (
              <DropdownMenuItem className="cursor-pointer" onClick={onDraft}>
                {t('dashboard.listings.actionDraft')}
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer text-amber-700 focus:text-amber-800" onClick={onSoftDelete}>
              {t('admin.softDelete')}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem className="cursor-pointer" onClick={onRestore}>
              {t('admin.restore')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={onHardDelete}>
              {t('admin.hardDelete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
