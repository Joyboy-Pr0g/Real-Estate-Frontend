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
import { usePermissions } from '@/features/admin/providers/permissions-provider';
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
  const { hasPermission } = usePermissions();

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
            {hasPermission('offices.view') ? (
              <DropdownMenuItem asChild>
                <Link href={`/admin/offices/${office.id}`} className="cursor-pointer">
                  {t('admin.viewDetails')}
                </Link>
              </DropdownMenuItem>
            ) : null}

            {office.verification_status === 'pending' || office.verification_status === 'rejected' ? (
              hasPermission('offices.verify') ? (
                <DropdownMenuItem className="cursor-pointer" onClick={onVerify}>
                  {t('admin.verify')}
                </DropdownMenuItem>
              ) : null
            ) : null}

            {office.verification_status === 'pending' ? (
              hasPermission('offices.reject') ? (
                <DropdownMenuItem className="cursor-pointer" onClick={onReject}>
                  {t('admin.reject')}
                </DropdownMenuItem>
              ) : null
            ) : null}

            {office.verification_status === 'verified' ? (
              hasPermission('offices.suspend') ? (
                <DropdownMenuItem className="cursor-pointer" onClick={onSuspend}>
                  {t('admin.suspend')}
                </DropdownMenuItem>
              ) : null
            ) : null}

            {office.verification_status === 'suspended' ? (
              hasPermission('offices.unsuspend') ? (
                <DropdownMenuItem className="cursor-pointer" onClick={onUnsuspend}>
                  {t('admin.unsuspend')}
                </DropdownMenuItem>
              ) : null
            ) : null}

            {hasPermission('offices.bulk_delete') ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-amber-700 focus:text-amber-800" onClick={onSoftDelete}>
                  {t('admin.softDelete')}
                </DropdownMenuItem>
              </>
            ) : null}
          </>
        ) : (
          <>
            {hasPermission('offices.bulk_delete') ? (
              <>
                <DropdownMenuItem className="cursor-pointer" onClick={onRestore}>
                  {t('admin.restore')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={onHardDelete}>
                  {t('admin.hardDelete')}
                </DropdownMenuItem>
              </>
            ) : null}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
