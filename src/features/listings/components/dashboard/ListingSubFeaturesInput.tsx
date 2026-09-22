'use client';

import { useMemo, useState } from 'react';
import { PublicMainFeature } from '@/features/catalog/types/feature';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ListingSubFeaturesInputProps {
  mainFeatures: PublicMainFeature[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

const selectClass =
  'h-11 w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-start outline-none focus:border-brand/40 focus:bg-white';

export function ListingSubFeaturesInput({
  mainFeatures,
  selectedIds,
  onChange,
  disabled = false,
}: ListingSubFeaturesInputProps) {
  const { t } = useLocale();

  const categories = useMemo(
    () =>
      mainFeatures
        .filter((main) => main.sub_features.length > 0)
        .slice()
        .sort((a, b) => a.order - b.order),
    [mainFeatures],
  );

  const [filterMainId, setFilterMainId] = useState(() => categories[0]?.id ?? '');

  const effectiveMainId =
    categories.some((main) => main.id === filterMainId) ? filterMainId : (categories[0]?.id ?? '');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredSubs = useMemo(() => {
    const main = categories.find((item) => item.id === effectiveMainId);
    return main?.sub_features.slice().sort((a, b) => a.order - b.order) ?? [];
  }, [categories, effectiveMainId]);

  const subNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const main of mainFeatures) {
      for (const sub of main.sub_features) {
        map.set(sub.id, sub.name);
      }
    }
    return map;
  }, [mainFeatures]);

  const toggleSubFeature = (id: string) => {
    if (disabled) return;
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  const removeSubFeature = (id: string) => {
    if (disabled) return;
    onChange(selectedIds.filter((item) => item !== id));
  };

  if (categories.length === 0) {
    return <p className="text-sm text-gray-400">{t('dashboard.listings.noFeaturesAvailable')}</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-primary-dark">{t('dashboard.listings.subFeatures')}</h3>
        <p className="mt-1 text-xs text-gray-500">{t('dashboard.listings.subFeaturesHint')}</p>
      </div>

      <label className="block max-w-md space-y-1.5">
        <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.mainFeatureFilter')}</span>
        <select
          value={effectiveMainId}
          disabled={disabled}
          onChange={(event) => setFilterMainId(event.target.value)}
          className={selectClass}
        >
          {categories.map((main) => (
            <option key={main.id} value={main.id}>
              {main.name}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.pickSubFeatures')}</span>
        <div className="flex flex-wrap gap-2">
          {filteredSubs.map((sub) => {
            const active = selectedSet.has(sub.id);
            return (
              <button
                key={sub.id}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => toggleSubFeature(sub.id)}
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-brand bg-brand-muted text-brand-dark'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-brand/40',
                  disabled && 'cursor-not-allowed opacity-60',
                )}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
        {filteredSubs.length === 0 ? (
          <p className="text-sm text-gray-400">{t('admin.noSubFeatures')}</p>
        ) : null}
      </div>

      {selectedIds.length > 0 ? (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-500">
            {t('dashboard.listings.selectedSubFeaturesCount').replace('{count}', String(selectedIds.length))}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => removeSubFeature(id)}
                className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand-dark hover:bg-brand/15"
              >
                <span>{subNameById.get(id) ?? id}</span>
                <span aria-hidden className="text-brand/70">
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
