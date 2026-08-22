'use client';

import Image from 'next/image';
import { AdminCity } from '@/features/admin/types/locations';
import { CityActionsMenu } from '@/features/admin/components/cities/CityActionsMenu';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface CityTableProps {
  items: AdminCity[];
  actionId: string | null;
  onEdit: (item: AdminCity) => void;
  onDelete: (item: AdminCity) => void;
}

export function CityTable({ items, actionId, onEdit, onDelete }: CityTableProps) {
  const { t } = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.cityPhoto')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.catalogName')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.governorate')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.cityPcode')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.updatedAt')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <Image
                    src={item.city_photo.url}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                </td>
                <td className="px-5 py-4 font-semibold text-primary-dark">{item.name}</td>
                <td className="px-5 py-4 text-gray-600">{item.governorate}</td>
                <td className="px-5 py-4 text-gray-500">{item.pcode}</td>
                <td className="px-5 py-4 text-gray-500">{formatDateTime(item.updated_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <CityActionsMenu
                      item={item}
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
