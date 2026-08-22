'use client';

import { AdminSubFeature } from '@/features/admin/types/features';
import { SubFeatureActionsMenu } from '@/features/admin/components/sub-features/SubFeatureActionsMenu';
import { CatalogIconDisplay } from '@/features/admin/components/shared/CatalogIconDisplay';
import { formatDateTime } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/locale-provider';

interface SubFeatureCardProps {
  item: AdminSubFeature;
  actionId: string | null;
  mainFeatureName: string;
  onEdit: (item: AdminSubFeature) => void;
  onDelete: (item: AdminSubFeature) => void;
}

export function SubFeatureCard({
  item,
  actionId,
  mainFeatureName,
  onEdit,
  onDelete,
}: SubFeatureCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-primary-dark">{item.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{mainFeatureName}</p>
        </div>
        <SubFeatureActionsMenu
          disabled={actionId === item.id}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-gray-400">{t('admin.catalogSlug')}</dt>
          <dd className="font-medium text-gray-700">{item.slug}</dd>
        </div>
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
        <div className="col-span-2">
          <dt className="text-gray-400">{t('admin.updatedAt')}</dt>
          <dd className="font-medium text-gray-700">{formatDateTime(item.updated_at)}</dd>
        </div>
      </dl>
    </article>
  );
}
