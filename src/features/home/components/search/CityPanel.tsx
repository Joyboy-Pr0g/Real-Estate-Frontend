'use client';

import { MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PublicCity } from '@/features/catalog/types/catalog';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface CityPanelProps {
  cities: PublicCity[];
  selectedId: string | null;
  onSelect: (city: PublicCity) => void;
  compact?: boolean;
}

export function CityPanel({ cities, selectedId, onSelect, compact = false }: CityPanelProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.governorate.toLowerCase().includes(q),
    );
  }, [cities, query]);

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {!compact ? (
        <p className="text-sm font-semibold text-primary-dark">{t('search.suggestedCities')}</p>
      ) : null}

      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.whereHint')}
          className={cn(
            'w-full ps-9 pe-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15 transition-colors',
            compact ? 'h-9' : 'h-11 ps-10 pe-4 rounded-xl',
          )}
          autoFocus={!compact}
        />
      </div>

      <ul
        className={cn(
          'overflow-y-auto space-y-0.5',
          compact ? 'max-h-44' : 'max-h-[min(50vh,420px)] space-y-1 -mx-2 px-2',
        )}
      >
        {filtered.length === 0 && (
          <li className="py-6 text-center text-sm text-gray-500">{t('search.noResults')}</li>
        )}
        {filtered.map((city) => (
          <li key={city.id}>
            <button
              type="button"
              onClick={() => onSelect(city)}
              className={cn(
                'w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-start transition-colors',
                compact ? 'py-1.5' : 'gap-3 rounded-xl px-3 py-3',
                selectedId === city.id ? 'bg-brand-muted/60 ring-1 ring-brand/15' : 'hover:bg-gray-50',
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
              <span className="min-w-0">
                <span className={cn('block font-semibold text-primary-dark truncate', compact ? 'text-xs' : 'text-sm')}>
                  {city.name}
                </span>
                {!compact ? (
                  <span className="block text-xs text-gray-500 truncate">{city.governorate}</span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
