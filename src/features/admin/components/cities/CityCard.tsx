'use client';

import Image from 'next/image';
import { AdminCity } from '@/features/admin/types/locations';
import { CityActionsMenu } from '@/features/admin/components/cities/CityActionsMenu';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface CityCardProps {
  item: AdminCity;
  actionId: string | null;
  onEdit: (item: AdminCity) => void;
  onDelete: (item: AdminCity) => void;
}

export function CityCard({ item, actionId, onEdit, onDelete }: CityCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <Image
          src={item.city_photo.url}
          alt={item.name}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-primary-dark">{item.name}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{item.governorate}</p>
            </div>
            <CityActionsMenu
              item={item}
              disabled={actionId === item.id}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-gray-400">{t('admin.cityPcode')}</dt>
              <dd className="font-medium text-gray-700">{item.pcode}</dd>
            </div>
            <div>
              <dt className="text-gray-400">{t('admin.updatedAt')}</dt>
              <dd className="font-medium text-gray-700">{formatDateTime(item.updated_at)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}
