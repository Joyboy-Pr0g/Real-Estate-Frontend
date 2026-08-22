'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminPropertyType } from '@/features/admin/types/catalog';
import { useLocale } from '@/lib/i18n/locale-provider';

interface PropertyTypeActionsMenuProps {
  item: AdminPropertyType;
  disabled?: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

export function PropertyTypeActionsMenu({
  item,
  disabled = false,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: PropertyTypeActionsMenuProps) {
  const { t } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-primary-dark disabled:opacity-50"
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
          {t('admin.edit')}
        </DropdownMenuItem>
        {item.status === 'active' ? (
          <DropdownMenuItem className="cursor-pointer" onClick={onDeactivate}>
            {t('admin.deactivateUser')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="cursor-pointer" onClick={onActivate}>
            {t('admin.activateUser')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={onDelete}>
          {t('admin.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
