'use client';

import { AdminNeighborhood } from '@/features/admin/types/locations';
import { NeighborhoodActionsMenu } from '@/features/admin/components/neighborhoods/NeighborhoodActionsMenu';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface NeighborhoodTableProps {
  items: AdminNeighborhood[];
  actionId: string | null;
  onEdit: (item: AdminNeighborhood) => void;
  onDelete: (item: AdminNeighborhood) => void;
}

export function NeighborhoodTable({ items, actionId, onEdit, onDelete }: NeighborhoodTableProps) {
  const { t } = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.catalogName')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.city')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.neighborhoodPcode')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.population')}</th>
              <th className="px-5 py-4 font-semibold text-gray-600">{t('admin.updatedAt')}</th>
              <th className="px-5 py-4 text-end font-semibold text-gray-600">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4 font-semibold text-primary-dark">{item.name}</td>
                <td className="px-5 py-4 text-gray-600">{item.city?.name ?? '—'}</td>
                <td className="px-5 py-4 text-gray-500">{item.neighb_pcode}</td>
                <td className="px-5 py-4 text-gray-500">{item.population.toLocaleString()}</td>
                <td className="px-5 py-4 text-gray-500">{formatDateTime(item.updated_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <NeighborhoodActionsMenu
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
