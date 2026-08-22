'use client';

import { AdminMainFeature } from '@/features/admin/types/features';
import { MainFeatureActionsMenu } from '@/features/admin/components/features/MainFeatureActionsMenu';
import { CatalogIconDisplay } from '@/features/admin/components/shared/CatalogIconDisplay';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface MainFeatureCardProps {
  item: AdminMainFeature;
  actionId: string | null;
  onEdit: (item: AdminMainFeature) => void;
  onDelete: (item: AdminMainFeature) => void;
}

export function MainFeatureCard({ item, actionId, onEdit, onDelete }: MainFeatureCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-primary-dark">{item.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{item.slug}</p>
        </div>
        <MainFeatureActionsMenu
          item={item}
          disabled={actionId === item.id}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-gray-400">{t('admin.catalogIcon')}</dt>
          <dd className="font-medium text-gray-700">
            <CatalogIconDisplay icon={item.icon} />
          </dd>
        </div>
        <div>
          <dt className="text-gray-400">{t('admin.featureOrder')}</dt>
          <dd className="font-medium text-gray-700">{item.order}</dd>
        </div>
        <div>
          <dt className="text-gray-400">{t('admin.subFeaturesCount')}</dt>
          <dd className="font-medium text-gray-700">{item.sub_features?.length ?? 0}</dd>
        </div>
        <div>
          <dt className="text-gray-400">{t('admin.updatedAt')}</dt>
          <dd className="font-medium text-gray-700">{formatDateTime(item.updated_at)}</dd>
        </div>
      </dl>
    </article>
  );
}
