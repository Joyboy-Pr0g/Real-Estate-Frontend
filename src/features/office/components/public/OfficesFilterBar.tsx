'use client';

import { Building2, Loader2, MapPin, RotateCcw, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { PublicCity } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface OfficesFilterBarProps {
  cities: PublicCity[];
  initialNeighborhoods?: PublicNeighborhood[];
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand/40';

export function OfficesFilterBar({ cities, initialNeighborhoods = [] }: OfficesFilterBarProps) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [cityId, setCityId] = useState(searchParams.get('cityId') ?? '');
  const [neighborhoodId, setNeighborhoodId] = useState(searchParams.get('neighborhoodId') ?? '');
  const [neighborhoods, setNeighborhoods] = useState(initialNeighborhoods);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const pushFilters = useCallback(
    (next: { search?: string; cityId?: string; neighborhoodId?: string }) => {
      const params = new URLSearchParams();
      const searchValue = next.search ?? debouncedSearch;
      const cityValue = next.cityId ?? cityId;
      const neighborhoodValue = next.neighborhoodId ?? neighborhoodId;

      if (searchValue.trim()) params.set('search', searchValue.trim());
      if (cityValue) params.set('cityId', cityValue);
      if (neighborhoodValue) params.set('neighborhoodId', neighborhoodValue);

      startTransition(() => {
        router.push(`/offices${params.toString() ? `?${params.toString()}` : ''}`);
      });
    },
    [cityId, debouncedSearch, neighborhoodId, router],
  );

  useEffect(() => {
    const current = searchParams.get('search') ?? '';
    if (debouncedSearch !== current) {
      pushFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, pushFilters, searchParams]);

  useEffect(() => {
    if (!cityId) {
      setNeighborhoods([]);
      return;
    }

    let cancelled = false;
    setLoadingNeighborhoods(true);

    void clientFetch<PublicNeighborhood[]>(bffPaths.neighborhoods.public, {
      searchParams: { city_id: cityId, limit: 100 },
    })
      .then((res) => {
        if (!cancelled) setNeighborhoods(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setNeighborhoods([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingNeighborhoods(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cityId]);

  const handleCityChange = (value: string) => {
    setCityId(value);
    setNeighborhoodId('');
    pushFilters({ cityId: value, neighborhoodId: '' });
  };

  const handleNeighborhoodChange = (value: string) => {
    setNeighborhoodId(value);
    pushFilters({ neighborhoodId: value });
  };

  const handleReset = () => {
    setSearch('');
    setCityId('');
    setNeighborhoodId('');
    startTransition(() => router.push('/offices'));
  };

  const hasFilters = Boolean(search || cityId || neighborhoodId);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('offices.filters.search')}
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('offices.filters.searchPlaceholder')}
              className={cn(fieldClass, 'ps-10')}
            />
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('filters.city')}
          </span>
          <div className="relative">
            <Building2 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={cityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className={cn(fieldClass, 'ps-10')}
            >
              <option value="">{t('filters.allCities')}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t('filters.neighborhood')}
          </span>
          <div className="relative">
            <MapPin className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={neighborhoodId}
              onChange={(e) => handleNeighborhoodChange(e.target.value)}
              disabled={!cityId || loadingNeighborhoods}
              className={cn(fieldClass, 'ps-10 disabled:cursor-not-allowed disabled:opacity-60')}
            >
              <option value="">{t('filters.allNeighborhoods')}</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <button
          type="button"
          onClick={handleReset}
          disabled={!hasFilters || pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          {t('filters.clearAll')}
        </button>
      </div>
    </div>
  );
}
