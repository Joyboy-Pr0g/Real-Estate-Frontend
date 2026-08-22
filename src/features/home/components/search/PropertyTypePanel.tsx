'use client';

import { PublicPropertyType } from '@/features/catalog/types/catalog';
import { getPropertyTypeIcon } from '@/features/catalog/utils/catalog-icons';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface PropertyTypePanelProps {
  propertyTypes: PublicPropertyType[];
  selectedId: string | null;
  onSelect: (type: PublicPropertyType) => void;
  compact?: boolean;
}

export function PropertyTypePanel({
  propertyTypes,
  selectedId,
  onSelect,
  compact = false,
}: PropertyTypePanelProps) {
  const { t } = useLocale();

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {!compact ? (
        <p className="text-sm font-semibold text-primary-dark">{t('search.suggestedTypes')}</p>
      ) : null}
      <ul
        className={cn(
          'grid gap-0.5 overflow-y-auto',
          compact
            ? 'max-h-44 grid-cols-2 sm:grid-cols-3'
            : 'max-h-[min(50vh,420px)] grid-cols-1 sm:grid-cols-2 gap-1 -mx-2 px-2',
        )}
      >
        {propertyTypes.map((type) => {
          const Icon = getPropertyTypeIcon(type.icon);
          return (
            <li key={type.id}>
              <button
                type="button"
                onClick={() => onSelect(type)}
                className={cn(
                  'w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-start transition-colors',
                  compact ? 'flex-col items-start gap-1 py-2' : 'gap-3 rounded-xl px-3 py-3',
                  selectedId === type.id ? 'bg-brand-muted/60 ring-1 ring-brand/15' : 'hover:bg-gray-50',
                )}
              >
                <span
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand',
                    compact ? 'h-7 w-7' : 'h-11 w-11 rounded-xl',
                  )}
                >
                  <Icon className={compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
                </span>
                <span className="min-w-0">
                  <span className={cn('block font-semibold text-primary-dark truncate', compact ? 'text-[11px] leading-tight' : 'text-sm')}>
                    {type.name}
                  </span>
                  {!compact ? (
                    <span className="block text-xs text-gray-500 capitalize">{type.slug.replace(/-/g, ' ')}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
