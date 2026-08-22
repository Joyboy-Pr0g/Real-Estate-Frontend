'use client';

import { AdminPropertySubtype, AdminPropertyType } from '@/features/admin/types/catalog';
import { PropertySubtypeActionsMenu } from '@/features/admin/components/property-subtypes/PropertySubtypeActionsMenu';
import { CatalogIconDisplay } from '@/features/admin/components/shared/CatalogIconDisplay';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface PropertySubtypeCardProps {
  item: AdminPropertySubtype;
  propertyTypeName: string;
  actionId: string | null;
  onEdit: (item: AdminPropertySubtype) => void;
  onDelete: (item: AdminPropertySubtype) => void;
}

export function PropertySubtypeCard({
  item,
  propertyTypeName,
  actionId,
  onEdit,
  onDelete,
}: PropertySubtypeCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-primary-dark">{item.name}</h3>
          <p className="truncate text-sm text-gray-500">{propertyTypeName}</p>
        </div>
        <PropertySubtypeActionsMenu
          disabled={actionId === item.id}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
        <CatalogIconDisplay icon={item.icon} />
        <span>{t('admin.specVersion')}: v{item.spec_schema_version}</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">{formatDateTime(item.updated_at)}</p>
    </article>
  );
}
