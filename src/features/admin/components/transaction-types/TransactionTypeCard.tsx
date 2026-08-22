'use client';

import { AdminTransactionType } from '@/features/admin/types/catalog';
import { TransactionTypeActionsMenu } from '@/features/admin/components/transaction-types/TransactionTypeActionsMenu';
import { CatalogIconDisplay } from '@/features/admin/components/shared/CatalogIconDisplay';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface TransactionTypeCardProps {
  item: AdminTransactionType;
  actionId: string | null;
  onEdit: (item: AdminTransactionType) => void;
  onDelete: (item: AdminTransactionType) => void;
}

export function TransactionTypeCard({ item, actionId, onEdit, onDelete }: TransactionTypeCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-primary-dark">{item.display_name_ar}</h3>
          <p className="truncate text-sm text-gray-500">{item.name}</p>
        </div>
        <TransactionTypeActionsMenu
          disabled={actionId === item.id}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
        <span>{item.slug}</span>
        <CatalogIconDisplay icon={item.icon} />
      </div>
      <p className="mt-2 text-sm text-gray-500">{formatDateTime(item.updated_at)}</p>
    </article>
  );
}
