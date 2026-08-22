'use client';

import { AdminNeighborhood } from '@/features/admin/types/locations';
import { NeighborhoodActionsMenu } from '@/features/admin/components/neighborhoods/NeighborhoodActionsMenu';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface NeighborhoodCardProps {
  item: AdminNeighborhood;
  actionId: string | null;
  onEdit: (item: AdminNeighborhood) => void;
  onDelete: (item: AdminNeighborhood) => void;
}

export function NeighborhoodCard({ item, actionId, onEdit, onDelete }: NeighborhoodCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-primary-dark">{item.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{item.city?.name ?? '—'}</p>
        </div>
        <NeighborhoodActionsMenu
          disabled={actionId === item.id}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-gray-400">{t('admin.neighborhoodPcode')}</dt>
          <dd className="font-medium text-gray-700">{item.neighb_pcode}</dd>
        </div>
        <div>
          <dt className="text-gray-400">{t('admin.population')}</dt>
          <dd className="font-medium text-gray-700">{item.population.toLocaleString()}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-gray-400">{t('admin.updatedAt')}</dt>
          <dd className="font-medium text-gray-700">{formatDateTime(item.updated_at)}</dd>
        </div>
      </dl>
    </article>
  );
}
