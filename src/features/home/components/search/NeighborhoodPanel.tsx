'use client';

import { Loader2, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { FilterOptionsSkeleton } from '@/features/listings/components/filter/FilterSegment';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface NeighborhoodPanelProps {
  neighborhoods: PublicNeighborhood[];
  selectedPcode: string | null;
  onSelect: (neighborhood: PublicNeighborhood | null) => void;
  compact?: boolean;
  loading?: boolean;
}

export function NeighborhoodPanel({
  neighborhoods,
  selectedPcode,
  onSelect,
  compact = false,
  loading = false,
}: NeighborhoodPanelProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return neighborhoods;
    return neighborhoods.filter((neighborhood) => neighborhood.name.toLowerCase().includes(q));
  }, [neighborhoods, query]);

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {!compact ? (
        <p className="text-sm font-semibold text-primary-dark">{t('filters.neighborhood')}</p>
      ) : null}

      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.neighborhoodHint')}
          disabled={loading}
          className={cn(
            'w-full rounded-lg border border-gray-200 bg-gray-50 ps-9 pe-3 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15',
            compact ? 'h-9' : 'h-11 rounded-xl ps-10 pe-4',
            loading && 'cursor-wait opacity-60',
          )}
        />
      </div>

      {loading ? (
        <div className="space-y-3 py-1">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
            <span>{t('search.loading')}</span>
          </div>
          <FilterOptionsSkeleton variant="list" count={compact ? 4 : 5} />
        </div>
      ) : (
        <ul
          className={cn(
            'space-y-0.5 overflow-y-auto',
            compact ? 'max-h-44' : 'max-h-[min(50vh,420px)] -mx-2 space-y-1 px-2',
          )}
        >
          <li>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start transition-colors',
                compact ? 'py-1.5' : 'gap-3 rounded-xl px-3 py-3',
                !selectedPcode ? 'bg-brand-muted/60 ring-1 ring-brand/15' : 'hover:bg-gray-50',
              )}
            >
              <span
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand',
                  compact ? 'h-8 w-8' : 'h-11 w-11 rounded-xl',
                )}
              >
                <MapPin className={compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
              </span>
              <span className={cn('min-w-0 font-semibold text-primary-dark', compact ? 'text-xs' : 'text-sm')}>
                {t('filters.allNeighborhoods')}
              </span>
            </button>
          </li>

          {filtered.length === 0 ? (
            <li className="py-6 text-center text-sm text-gray-500">{t('search.noResults')}</li>
          ) : (
            filtered.map((neighborhood) => (
              <li key={neighborhood.id}>
                <button
                  type="button"
                  onClick={() => onSelect(neighborhood)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start transition-colors',
                    compact ? 'py-1.5' : 'gap-3 rounded-xl px-3 py-3',
                    selectedPcode === neighborhood.neighb_pcode
                      ? 'bg-brand-muted/60 ring-1 ring-brand/15'
                      : 'hover:bg-gray-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand',
                      compact ? 'h-8 w-8' : 'h-11 w-11 rounded-xl',
                    )}
                  >
                    <MapPin className={compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
                  </span>
                  <span
                    className={cn(
                      'min-w-0 truncate font-semibold text-primary-dark',
                      compact ? 'text-xs' : 'text-sm',
                    )}
                  >
                    {neighborhood.name}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
