'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminMainFeature } from '@/features/admin/types/features';
import { useLocale } from '@/lib/i18n/locale-provider';

interface MainFeatureActionsMenuProps {
  item: AdminMainFeature;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function MainFeatureActionsMenu({
  item,
  disabled = false,
  onEdit,
  onDelete,
}: MainFeatureActionsMenuProps) {
  const { t } = useLocale();
  const hasSubFeatures = (item.sub_features?.length ?? 0) > 0;

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
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-700"
          disabled={hasSubFeatures}
          onClick={onDelete}
        >
          {t('admin.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
