'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminUserListItem } from '@/features/auth/types/user';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { useLocale } from '@/lib/i18n/locale-provider';

interface UserActionsMenuProps {
  user: AdminUserListItem;
  disabled?: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onChangeRole: () => void;
  onChangePassword: () => void;
  onSoftDelete: () => void;
  onRestore: () => void;
  onHardDelete: () => void;
}

export function UserActionsMenu({
  user,
  disabled = false,
  onActivate,
  onDeactivate,
  onChangeRole,
  onChangePassword,
  onSoftDelete,
  onRestore,
  onHardDelete,
}: UserActionsMenuProps) {
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
      <DropdownMenuContent align="end" className="w-48">
        {!user.deleted_at ? (
          <>
            {user.status === 'active' ? (
              <>
                {hasPermission('users.deactivate') ? (
                  <DropdownMenuItem className="cursor-pointer" onClick={onDeactivate}>
                    {t('admin.deactivateUser')}
                  </DropdownMenuItem>
                ) : null}

                {hasPermission('users.change_role') ? (
                  <DropdownMenuItem className="cursor-pointer" onClick={onChangeRole}>
                    {t('admin.changeRole')}
                  </DropdownMenuItem>
                ) : null}

                {hasPermission('users.change_password') ? (
                  <DropdownMenuItem className="cursor-pointer" onClick={onChangePassword}>
                    {t('admin.changePassword')}
                  </DropdownMenuItem>
                ) : null}
              </>
            ) : (
              <>
                {hasPermission('users.activate') ? (
                  <DropdownMenuItem className="cursor-pointer" onClick={onActivate}>
                    {t('admin.activateUser')}
                  </DropdownMenuItem>
                ) : null}
              </>
            )}
            {hasPermission('users.soft_delete') ? (
              <DropdownMenuItem className="cursor-pointer text-amber-700 focus:text-amber-800" onClick={onSoftDelete}>
                {t('admin.softDeleteUser')}
              </DropdownMenuItem>
            ) : null}
          </>
        ) : (
          <>
            {hasPermission('users.restore') ? (
              <DropdownMenuItem className="cursor-pointer" onClick={onRestore}>
                {t('admin.restoreUser')}
              </DropdownMenuItem>
            ) : null}
            {hasPermission('users.delete') ? (
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={onHardDelete}>
                {t('admin.deleteUser')}
              </DropdownMenuItem>
            ) : null}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
