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
import { PublicListing } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';

interface MyListingsActionsMenuProps {
  listing: PublicListing;
  editHref: string;
  disabled?: boolean;
  onPublish: () => void;
  onDraft: () => void;
  onMarkSold: () => void;
  onMarkRented: () => void;
  onSoftDelete: () => void;
}

export function MyListingsActionsMenu({
  listing,
  editHref,
  disabled = false,
  onPublish,
  onDraft,
  onMarkSold,
  onMarkRented,
  onSoftDelete,
}: MyListingsActionsMenuProps) {
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
        <DropdownMenuItem asChild>
          <Link href={editHref} className="cursor-pointer">
            {t('admin.edit')}
          </Link>
        </DropdownMenuItem>

        {listing.status === 'draft' ? (
          <DropdownMenuItem className="cursor-pointer" onClick={onPublish}>
            {t('dashboard.listings.actionPublish')}
          </DropdownMenuItem>
        ) : null}

        {listing.status === 'published' ? (
          <DropdownMenuItem className="cursor-pointer" onClick={onDraft}>
            {t('dashboard.listings.actionDraft')}
          </DropdownMenuItem>
        ) : null}

        {listing.status === 'published' ? (
          <DropdownMenuItem className="cursor-pointer" onClick={onMarkSold}>
            {t('dashboard.listings.actionSold')}
          </DropdownMenuItem>
        ) : null}

        {listing.status === 'published' ? (
          <DropdownMenuItem className="cursor-pointer" onClick={onMarkRented}>
            {t('dashboard.listings.actionRented')}
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={onSoftDelete}>
          {t('dashboard.listings.actionSoftDelete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
