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
import { OfficeDetail } from '@/features/office/types/office';
import { useLocale } from '@/lib/i18n/locale-provider';

interface OfficeActionsMenuProps {
  office: OfficeDetail;
  disabled?: boolean;
  onVerify: () => void;
  onReject: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
  onSoftDelete: () => void;
  onRestore: () => void;
  onHardDelete: () => void;
}

export function OfficeActionsMenu({
  office,
  disabled = false,
  onVerify,
  onReject,
  onSuspend,
  onUnsuspend,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: OfficeActionsMenuProps) {
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
        {!office.deleted_at ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/admin/offices/${office.id}`} className="cursor-pointer">
                {t('admin.viewDetails')}
              </Link>
            </DropdownMenuItem>

            {office.verification_status === 'pending' || office.verification_status === 'rejected' ? (
              <DropdownMenuItem className="cursor-pointer" onClick={onVerify}>
                {t('admin.verify')}
              </DropdownMenuItem>
            ) : null}

            {office.verification_status === 'pending' ? (
              <DropdownMenuItem className="cursor-pointer" onClick={onReject}>
                {t('admin.reject')}
              </DropdownMenuItem>
            ) : null}

            {office.verification_status === 'verified' ? (
              <DropdownMenuItem className="cursor-pointer" onClick={onSuspend}>
                {t('admin.suspend')}
              </DropdownMenuItem>
            ) : null}

            {office.verification_status === 'suspended' ? (
              <DropdownMenuItem className="cursor-pointer" onClick={onUnsuspend}>
                {t('admin.unsuspend')}
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
