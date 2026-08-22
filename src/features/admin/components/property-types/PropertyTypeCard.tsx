'use client';

import { AdminPropertyType } from '@/features/admin/types/catalog';
import { PropertyTypeActionsMenu } from '@/features/admin/components/property-types/PropertyTypeActionsMenu';
import { CatalogStatusBadge } from '@/features/admin/components/shared/CatalogStatusBadge';
import { CatalogIconDisplay } from '@/features/admin/components/shared/CatalogIconDisplay';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface PropertyTypeCardProps {
  item: AdminPropertyType;
  actionId: string | null;
  onEdit: (item: AdminPropertyType) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onDelete: (item: AdminPropertyType) => void;
}

export function PropertyTypeCard({
  item,
  actionId,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: PropertyTypeCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-primary-dark">{item.name}</h3>
          <p className="truncate text-sm text-gray-500">{item.slug}</p>
        </div>
        <PropertyTypeActionsMenu
          item={item}
          disabled={actionId === item.id}
          onEdit={() => onEdit(item)}
          onActivate={() => onActivate(item.id)}
          onDeactivate={() => onDeactivate(item.id)}
          onDelete={() => onDelete(item)}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CatalogStatusBadge status={item.status} label={t(`admin.status.${item.status}`)} />
        <CatalogIconDisplay icon={item.icon} />
      </div>
      <p className="mt-2 text-sm text-gray-500">{formatDateTime(item.updated_at)}</p>
    </article>
  );
}
