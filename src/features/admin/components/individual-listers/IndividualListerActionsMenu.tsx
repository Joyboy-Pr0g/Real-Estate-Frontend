'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { IndividualListerProfile } from '@/features/individual-lister/types/individual-lister';
import { useLocale } from '@/lib/i18n/locale-provider';

interface IndividualListerActionsMenuProps {
  lister: IndividualListerProfile;
  disabled?: boolean;
  onVerify: () => void;
  onReject: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
  onSoftDelete: () => void;
  onRestore: () => void;
  onHardDelete: () => void;
}

export function IndividualListerActionsMenu({
  lister,
  disabled = false,
  onVerify,
  onReject,
  onSuspend,
  onUnsuspend,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: IndividualListerActionsMenuProps) {
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
        {!lister.deleted_at ? (
          <>
            {lister.verification_status === 'pending' || lister.verification_status === 'rejected' ? (
              hasPermission('individual_listers.verify') ? (
                <DropdownMenuItem className="cursor-pointer" onClick={onVerify}>
                  {t('admin.verify')}
                </DropdownMenuItem>
              ) : null
            ) : null}

            {lister.verification_status === 'pending' ? (
              hasPermission('individual_listers.reject') ? (
                <DropdownMenuItem className="cursor-pointer" onClick={onReject}>
                  {t('admin.reject')}
                </DropdownMenuItem>
              ) : null
            ) : null}

            {lister.verification_status === 'verified' ? (
              hasPermission('individual_listers.suspend') ? (
                <DropdownMenuItem className="cursor-pointer" onClick={onSuspend}>
                  {t('admin.suspend')}
                </DropdownMenuItem>
              ) : null
            ) : null}

            {lister.verification_status === 'suspended' ? (
              hasPermission('individual_listers.unsuspend') ? (
                <DropdownMenuItem className="cursor-pointer" onClick={onUnsuspend}>
                  {t('admin.unsuspend')}
                </DropdownMenuItem>
              ) : null
            ) : null}

            {hasPermission('individual_listers.soft_delete') ? (
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
            {hasPermission('individual_listers.restore') ? (
              <DropdownMenuItem className="cursor-pointer" onClick={onRestore}>
                {t('admin.restore')}
              </DropdownMenuItem>
            ) : null}
            {hasPermission('individual_listers.delete') ? (
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={onHardDelete}>
                {t('admin.hardDelete')}
              </DropdownMenuItem>
            ) : null}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
