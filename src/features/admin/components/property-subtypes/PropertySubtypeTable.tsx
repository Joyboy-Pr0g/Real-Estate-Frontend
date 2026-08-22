'use client';

import { AdminPropertySubtype, AdminPropertyType } from '@/features/admin/types/catalog';
import { PropertySubtypeActionsMenu } from '@/features/admin/components/property-subtypes/PropertySubtypeActionsMenu';
import { CatalogIconDisplay } from '@/features/admin/components/shared/CatalogIconDisplay';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface PropertySubtypeTableProps {
  items: AdminPropertySubtype[];
  propertyTypes: AdminPropertyType[];
  actionId: string | null;
  onEdit: (item: AdminPropertySubtype) => void;
  onDelete: (item: AdminPropertySubtype) => void;
}

export function PropertySubtypeTable({
  items,
  propertyTypes,
  actionId,
  onEdit,
  onDelete,
}: PropertySubtypeTableProps) {
  const { t } = useLocale();
  const typeName = (id: string) => propertyTypes.find((pt) => pt.id === id)?.name ?? '—';

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.catalogName')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.propertyType')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.catalogIcon')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.specVersion')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.updatedAt')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4 font-semibold text-primary-dark">{item.name}</td>
                <td className="px-5 py-4 text-gray-600">{typeName(item.property_type_id)}</td>
                <td className="px-5 py-4">
                  <CatalogIconDisplay icon={item.icon} />
                </td>
                <td className="px-5 py-4 text-gray-500">v{item.spec_schema_version}</td>
                <td className="px-5 py-4 text-gray-500">{formatDateTime(item.updated_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <PropertySubtypeActionsMenu
                      disabled={actionId === item.id}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
