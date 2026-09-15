'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { useLocale } from '@/lib/i18n/locale-provider';

interface PropertySubtypeActionsMenuProps {
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function PropertySubtypeActionsMenu({
  disabled = false,
  onEdit,
  onDelete,
}: PropertySubtypeActionsMenuProps) {
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
        {hasPermission('property_subtypes.edit') ? (
          <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
            {t('admin.edit')}
          </DropdownMenuItem>
        ) : null}
        {hasPermission('property_subtypes.delete') ? (
          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={onDelete}>
            {t('admin.delete')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
