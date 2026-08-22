'use client';

import { Building2,
  KeyRound,
  Loader2,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { PublicCatalog } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';
import { CityPanel } from '@/features/home/components/search/CityPanel';
import { PropertyTypePanel } from '@/features/home/components/search/PropertyTypePanel';
import { BudgetPanel } from '@/features/home/components/search/BudgetPanel';
import { LISTING_URL_PARAMS } from '@/features/listings/constants/search-url-params';
import {
  FilterChip,
  FilterExpandPanel,
  FilterSegment,
  NeighborhoodChip,
  SubtypeChip,
} from '@/features/listings/components/filter/FilterSegment';
import { SpecFiltersPanel } from '@/features/listings/components/filter/SpecFiltersPanel';
import { normalizePublicNeighborhoods } from '@/features/catalog/lib/normalize-neighborhood';
import { buildListingsHref } from '@/features/listings/lib/build-listings-url';
import {
  clearSpecFromSearchParams,
  countActiveSpecFilters,
  parseSpecFromSearchParams,
} from '@/features/listings/lib/spec-url';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

type PanelId = 'location' | 'property' | 'transaction' | 'budget';

interface ListingsFilterBarProps {
  catalog: PublicCatalog;
  initialNeighborhoods?: PublicNeighborhood[];
  initialPropertySubtypes?: PublicPropertySubtype[];
  className?: string;
}

export function ListingsFilterBar({
  catalog,
  initialNeighborhoods = [],
  initialPropertySubtypes = [],
  className,
}: ListingsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const barRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [specOpen, setSpecOpen] = useState(false);

  const currentCity = searchParams.get(LISTING_URL_PARAMS.city) ?? '';
  const currentNeighborhood = (() => {
    const value = searchParams.get(LISTING_URL_PARAMS.neighborhood) ?? '';
    return value === 'undefined' ? '' : value;
  })();
  const currentPropertyType = searchParams.get(LISTING_URL_PARAMS.propertyType) ?? '';
  const currentPropertySubtype = searchParams.get(LISTING_URL_PARAMS.propertySubtype) ?? '';
  const currentTransaction = searchParams.get(LISTING_URL_PARAMS.transactionType) ?? '';
  const minPriceParam = searchParams.get(LISTING_URL_PARAMS.minPrice) ?? '';
  const maxPriceParam = searchParams.get(LISTING_URL_PARAMS.maxPrice) ?? '';

  const selectedCity = useMemo(
    () => catalog.cities.find((city) => city.pcode === currentCity) ?? null,
    [catalog.cities, currentCity],
  );

  const selectedPropertyType = useMemo(
    () => catalog.propertyTypes.find((type) => type.slug === currentPropertyType) ?? null,
    [catalog.propertyTypes, currentPropertyType],
  );

  const selectedTransaction = useMemo(
    () => catalog.transactionTypes.find((type) => type.slug === currentTransaction) ?? null,
    [catalog.transactionTypes, currentTransaction],
  );

  const [neighborhoods, setNeighborhoods] = useState<PublicNeighborhood[]>(() =>
    normalizePublicNeighborhoods(
      initialNeighborhoods as Array<PublicNeighborhood & Record<string, unknown>>,
    ),
  );
  const [propertySubtypes, setPropertySubtypes] =
    useState<PublicPropertySubtype[]>(initialPropertySubtypes);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [loadingSubtypes, setLoadingSubtypes] = useState(false);

  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);
  const priceFocusedRef = useRef(false);
  const suppressPriceSyncRef = useRef(false);
  const debouncedMinPrice = useDebounce(minPriceInput, 500);
  const debouncedMaxPrice = useDebounce(maxPriceInput, 500);

  const selectedSubtype = useMemo(
    () => propertySubtypes.find((item) => item.slug === currentPropertySubtype) ?? null,
    [propertySubtypes, currentPropertySubtype],
  );

  const resolvedNeighborhood = useMemo(
    () => neighborhoods.find((n) => n.neighb_pcode === currentNeighborhood) ?? null,
    [neighborhoods, currentNeighborhood],
  );

  const activeSpecCount = countActiveSpecFilters(parseSpecFromSearchParams(searchParams));
  const hasFilterableSpecFields = useMemo(() => {
    if (!selectedSubtype) return false;
    return Object.values(selectedSubtype.spec_schema.fields).some((field) => field.filterable);
  }, [selectedSubtype]);

  const pushParams = useCallback(
    (updates: Record<string, string | null>, options?: { clearSpec?: boolean }) => {
      startTransition(() => {
        router.push(buildListingsHref(searchParamsRef.current, updates, options));
        router.refresh();
      });
    },
    [router],
  );

  const applySearchParams = useCallback(
    (next: URLSearchParams) => {
      startTransition(() => {
        const query = next.toString();
        router.push(query ? `/listings?${query}` : '/listings');
        router.refresh();
      });
    },
    [router],
  );

  const togglePanel = (id: PanelId) => {
    setActivePanel((current) => (current === id ? null : id));
  };

  useEffect(() => {
    if (!activePanel) return;
    const onPointerDown = (e: PointerEvent) => {
      if (barRef.current?.contains(e.target as Node)) return;
      setActivePanel(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [activePanel]);

  useEffect(() => {
    if (priceFocusedRef.current) return;
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  useEffect(() => {
    if (suppressPriceSyncRef.current) return;

    const minMatches = debouncedMinPrice === minPriceParam;
    const maxMatches = debouncedMaxPrice === maxPriceParam;
    if (minMatches && maxMatches) return;

    pushParams({
      [LISTING_URL_PARAMS.minPrice]: debouncedMinPrice || null,
      [LISTING_URL_PARAMS.maxPrice]: debouncedMaxPrice || null,
    });
  }, [debouncedMinPrice, debouncedMaxPrice, minPriceParam, maxPriceParam, pushParams]);

  useEffect(() => {
    if (!selectedCity) {
      setNeighborhoods([]);
      return;
    }

    let cancelled = false;
    setLoadingNeighborhoods(true);

    clientFetch<PublicNeighborhood[]>(bffPaths.neighborhoods.public, {
      params: { city_id: selectedCity.id },
    })
      .then((res) => {
        if (!cancelled) {
          setNeighborhoods(
            normalizePublicNeighborhoods(res.data as Array<PublicNeighborhood & Record<string, unknown>>),
          );
        }
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
  }, [selectedCity?.id]);

  useEffect(() => {
    if (!selectedPropertyType) {
      setPropertySubtypes([]);
      return;
    }

    let cancelled = false;
    setLoadingSubtypes(true);

    clientFetch<PublicPropertySubtype[]>(
      bffPaths.propertySubtypes.byPropertyType(selectedPropertyType.id),
    )
      .then((res) => {
        if (!cancelled) setPropertySubtypes(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setPropertySubtypes([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSubtypes(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPropertyType?.id]);

  const clearAll = () => {
    suppressPriceSyncRef.current = true;
    priceFocusedRef.current = false;
    setMinPriceInput('');
    setMaxPriceInput('');
    setActivePanel(null);
    startTransition(() => router.push('/listings'));
    window.setTimeout(() => {
      suppressPriceSyncRef.current = false;
    }, 600);
  };

  const activeFilterCount = [
    currentCity,
    currentNeighborhood,
    currentPropertyType,
    currentPropertySubtype,
    currentTransaction,
    minPriceParam,
    maxPriceParam,
  ].filter(Boolean).length + activeSpecCount;

  const budgetLabel =
    minPriceParam || maxPriceParam
      ? [minPriceParam, maxPriceParam].filter(Boolean).join(' – ')
      : '';

  const locationLabel = [selectedCity?.name, resolvedNeighborhood?.name]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <div
        ref={barRef}
        className={cn(
          'relative overflow-hidden rounded-xl border border-gray-200/70 bg-white shadow-[var(--shadow-soft)]',
          'ring-1 ring-black/[0.03]',
          pending && 'opacity-90',
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(40,177,109,0.06),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(40,177,109,0.04),transparent_50%)]" />

        <div className="relative flex items-center justify-between gap-2 border-b border-gray-100/80 px-3 py-2 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-muted text-brand">
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-xs font-bold text-primary-dark sm:text-sm">{t('filters.title')}</p>
              <p className="text-[10px] text-gray-500">
                {activeFilterCount > 0
                  ? t('filters.refineActive').replace('{count}', String(activeFilterCount))
                  : t('filters.refineHint')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden />
            ) : null}
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100/90 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200/90 hover:text-primary-dark"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t('filters.clearAll')}
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative flex min-h-[3.25rem] divide-x divide-gray-100/90 overflow-x-auto no-scrollbar">
          <FilterSegment
            icon={MapPin}
            label={t('search.where')}
            value={locationLabel}
            hint={t('filters.anyLocation')}
            active={activePanel === 'location'}
            dimmed={activePanel !== null && activePanel !== 'location'}
            onClick={() => togglePanel('location')}
          />
          <FilterSegment
            icon={Building2}
            label={t('search.type')}
            value={
              [selectedPropertyType?.name, selectedSubtype?.name].filter(Boolean).join(' · ')
            }
            hint={t('filters.anyType')}
            active={activePanel === 'property'}
            dimmed={activePanel !== null && activePanel !== 'property'}
            onClick={() => togglePanel('property')}
          />
          <FilterSegment
            icon={KeyRound}
            label={t('filters.deal')}
            value={selectedTransaction?.display_name_ar || selectedTransaction?.name || ''}
            hint={t('filters.allTransactions')}
            active={activePanel === 'transaction'}
            dimmed={activePanel !== null && activePanel !== 'transaction'}
            onClick={() => togglePanel('transaction')}
          />
          <FilterSegment
            icon={Wallet}
            label={t('search.budget')}
            value={budgetLabel}
            hint={t('filters.anyPrice')}
            active={activePanel === 'budget'}
            dimmed={activePanel !== null && activePanel !== 'budget'}
            onClick={() => togglePanel('budget')}
          />
        </div>

        <FilterExpandPanel open={activePanel === 'location'} compact>
          <CityPanel
            compact
            cities={catalog.cities}
            selectedId={selectedCity?.id ?? null}
            onSelect={(city) => {
              pushParams({
                [LISTING_URL_PARAMS.city]: city.pcode,
                [LISTING_URL_PARAMS.neighborhood]: null,
              });
            }}
          />

          {selectedCity ? (
            <div className="mt-2.5 border-t border-gray-100 pt-2.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-primary-dark">{t('filters.neighborhood')}</p>
                  {loadingNeighborhoods ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <NeighborhoodChip
                    label={t('filters.allNeighborhoods')}
                    selected={!currentNeighborhood}
                    onClick={() =>
                      pushParams({ [LISTING_URL_PARAMS.neighborhood]: null })
                    }
                  />
                  {neighborhoods.map((neighborhood) => (
                    <NeighborhoodChip
                      key={neighborhood.id}
                      label={neighborhood.name}
                      selected={currentNeighborhood === neighborhood.neighb_pcode}
                      onClick={() =>
                        pushParams({
                          [LISTING_URL_PARAMS.neighborhood]: neighborhood.neighb_pcode,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}
        </FilterExpandPanel>

        <FilterExpandPanel open={activePanel === 'property'} compact>
          <PropertyTypePanel
            compact
            propertyTypes={catalog.propertyTypes}
            selectedId={selectedPropertyType?.id ?? null}
            onSelect={(type) => {
              pushParams(
                {
                  [LISTING_URL_PARAMS.propertyType]: type.slug,
                  [LISTING_URL_PARAMS.propertySubtype]: null,
                },
                { clearSpec: true },
              );
            }}
          />

          {selectedPropertyType ? (
            <div className="mt-2.5 border-t border-gray-100 pt-2.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-primary-dark">
                    {t('filters.propertySubtype')}
                  </p>
                  {loadingSubtypes ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <SubtypeChip
                    label={t('filters.allSubtypes')}
                    selected={!currentPropertySubtype}
                    onClick={() => {
                      const next = new URLSearchParams(searchParamsRef.current.toString());
                      next.delete(LISTING_URL_PARAMS.propertySubtype);
                      clearSpecFromSearchParams(next);
                      next.delete(LISTING_URL_PARAMS.cursor);
                      applySearchParams(next);
                    }}
                  />
                  {propertySubtypes.map((subtype) => (
                    <SubtypeChip
                      key={subtype.id}
                      label={subtype.name}
                      selected={currentPropertySubtype === subtype.slug}
                      onClick={() => {
                        const next = new URLSearchParams(searchParamsRef.current.toString());
                        next.set(LISTING_URL_PARAMS.propertySubtype, subtype.slug);
                        clearSpecFromSearchParams(next);
                        next.delete(LISTING_URL_PARAMS.cursor);
                        applySearchParams(next);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
        </FilterExpandPanel>

        <FilterExpandPanel open={activePanel === 'transaction'} compact>
          <p className="mb-2 text-xs font-semibold text-primary-dark">{t('filters.transactionType')}</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                pushParams({ [LISTING_URL_PARAMS.transactionType]: null })
              }
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                !currentTransaction
                  ? 'border-brand bg-brand text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-brand/30',
              )}
            >
              {t('filters.allTransactions')}
            </button>
            {catalog.transactionTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() =>
                  pushParams({ [LISTING_URL_PARAMS.transactionType]: type.slug })
                }
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                  currentTransaction === type.slug
                    ? 'border-brand bg-brand text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-brand/30',
                )}
              >
                {type.display_name_ar || type.name}
              </button>
            ))}
          </div>
        </FilterExpandPanel>

        <FilterExpandPanel open={activePanel === 'budget'} compact>
          <BudgetPanel
            compact
            minPrice={minPriceInput}
            maxPrice={maxPriceInput}
            onMinChange={setMinPriceInput}
            onMaxChange={setMaxPriceInput}
          />
        </FilterExpandPanel>

        {activeFilterCount > 0 || (selectedSubtype && hasFilterableSpecFields) ? (
          <div className="relative flex flex-wrap items-center gap-1.5 border-t border-gray-100/80 bg-gray-50/40 px-3 py-2 sm:px-4">
            <Sparkles className="h-3.5 w-3.5 text-brand/70" aria-hidden />

            {selectedCity ? (
              <FilterChip
                label={selectedCity.name}
                onRemove={() =>
                  pushParams({
                    [LISTING_URL_PARAMS.city]: null,
                    [LISTING_URL_PARAMS.neighborhood]: null,
                  })
                }
              />
            ) : null}

            {resolvedNeighborhood && currentNeighborhood ? (
              <FilterChip
                label={resolvedNeighborhood.name}
                onRemove={() =>
                  pushParams({ [LISTING_URL_PARAMS.neighborhood]: null })
                }
              />
            ) : null}

            {selectedPropertyType ? (
              <FilterChip
                label={selectedPropertyType.name}
                onRemove={() =>
                  pushParams(
                    {
                      [LISTING_URL_PARAMS.propertyType]: null,
                      [LISTING_URL_PARAMS.propertySubtype]: null,
                    },
                    { clearSpec: true },
                  )
                }
              />
            ) : null}

            {selectedSubtype ? (
              <FilterChip
                label={selectedSubtype.name}
                onRemove={() => {
                  const next = new URLSearchParams(searchParamsRef.current.toString());
                  next.delete(LISTING_URL_PARAMS.propertySubtype);
                  clearSpecFromSearchParams(next);
                  next.delete(LISTING_URL_PARAMS.cursor);
                  applySearchParams(next);
                }}
              />
            ) : null}

            {selectedTransaction ? (
              <FilterChip
                label={selectedTransaction.display_name_ar || selectedTransaction.name}
                onRemove={() =>
                  pushParams({ [LISTING_URL_PARAMS.transactionType]: null })
                }
              />
            ) : null}

            {budgetLabel ? (
              <FilterChip
                label={budgetLabel}
                onRemove={() => {
                  priceFocusedRef.current = false;
                  setMinPriceInput('');
                  setMaxPriceInput('');
                  pushParams({
                    [LISTING_URL_PARAMS.minPrice]: null,
                    [LISTING_URL_PARAMS.maxPrice]: null,
                  });
                }}
              />
            ) : null}

            {selectedSubtype && hasFilterableSpecFields ? (
              <button
                type="button"
                onClick={() => setSpecOpen(true)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full py-1.5 ps-3 pe-3 text-xs font-semibold transition-all',
                  activeSpecCount > 0
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'bg-white text-primary-dark ring-1 ring-gray-200 hover:ring-brand/30',
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {t('filters.moreOptions')}
                {activeSpecCount > 0 ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[10px]">
                    {activeSpecCount}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <SpecFiltersPanel
        open={specOpen}
        schema={selectedSubtype?.spec_schema ?? null}
        searchParams={searchParams}
        onClose={() => setSpecOpen(false)}
        onApply={applySearchParams}
      />
    </>
  );
}
