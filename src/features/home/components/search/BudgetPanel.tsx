'use client';

import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface BudgetPanelProps {
  minPrice: string;
  maxPrice: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  compact?: boolean;
}

export function BudgetPanel({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  compact = false,
}: BudgetPanelProps) {
  const { t } = useLocale();

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {!compact ? (
        <p className="text-sm font-semibold text-primary-dark">{t('search.priceRange')}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-gray-500">{t('search.minPrice')}</span>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder="0"
            className={cn(
              'w-full px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15 transition-colors',
              compact ? 'h-9' : 'h-12 px-4 rounded-xl',
            )}
          />
        </label>
        <label className="space-y-1">
          <span className="text-[11px] font-medium text-gray-500">{t('search.maxPrice')}</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxChange(e.target.value)}
            placeholder="∞"
            className={cn(
              'w-full px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15 transition-colors',
              compact ? 'h-9' : 'h-12 px-4 rounded-xl',
            )}
          />
        </label>
      </div>
      {!compact ? (
        <p className="text-xs text-gray-400">{t('search.priceHint')}</p>
      ) : null}
    </div>
  );
}
