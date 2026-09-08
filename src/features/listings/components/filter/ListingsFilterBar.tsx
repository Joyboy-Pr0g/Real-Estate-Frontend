'use client';

import {
  Building2,
  KeyRound,
  Loader2,
  Map,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  X,
  Bookmark,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { PublicCatalog } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';
import { CityPanel } from '@/features/home/components/search/CityPanel';
import { NeighborhoodPanel } from '@/features/home/components/search/NeighborhoodPanel';
import { PropertyTypePanel } from '@/features/home/components/search/PropertyTypePanel';
import { BudgetPanel } from '@/features/home/components/search/BudgetPanel';
import { LISTING_URL_PARAMS } from '@/features/listings/constants/search-url-params';
import {
  DrillDownBack,
  FilterChip,
  FilterExpandPanel,
  FilterSegment,
  SubtypeChip,
} from '@/features/listings/components/filter/FilterSegment';
import { SpecFiltersPanel } from '@/features/listings/components/filter/SpecFiltersPanel';
import { SaveFavoriteFilterModal } from '@/features/listings/components/filter/SaveFavoriteFilterModal';
import { serializeListingFiltersFromSearchParams, buildListingsLoginRedirectFromSearchParams } from '@/features/listings/lib/serialize-listing-filters';
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
type LocationStep = 'city' | 'neighborhood';
type PropertyStep = 'type' | 'subtype';

interface ListingsFilterBarProps {
  catalog: PublicCatalog;
  initialNeighborhoods?: PublicNeighborhood[];
  initialPropertySubtypes?: PublicPropertySubtype[];
  isAuthenticated?: boolean;
  className?: string;
  basePath?: string;
}

export function ListingsFilterBar({
  catalog,
  initialNeighborhoods = [],
  initialPropertySubtypes = [],
  isAuthenticated = false,
  className,
  basePath = '/listings',
}: ListingsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [specOpen, setSpecOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saveFilterOpen, setSaveFilterOpen] = useState(false);

  const [locationStepOverride, setLocationStepOverride] = useState<LocationStep | null>(null);
  const [propertyStepOverride, setPropertyStepOverride] = useState<PropertyStep | null>(null);

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
        router.push(buildListingsHref(searchParams, updates, { ...options, basePath }));
        router.refresh();
      });
    },
    [router, basePath, searchParams],
  );

  const applySearchParams = useCallback(
    (next: URLSearchParams) => {
      startTransition(() => {
        const query = next.toString();
        router.push(query ? `${basePath}?${query}` : basePath);
        router.refresh();
      });
    },
    [router, basePath],
  );

  const togglePanel = (id: PanelId) => {
    setActivePanel((current) => (current === id ? null : id));
  };

  const locationStep: LocationStep = locationStepOverride ?? (selectedCity ? 'neighborhood' : 'city');
  const propertyStep: PropertyStep = propertyStepOverride ?? (selectedPropertyType ? 'subtype' : 'type');

  useEffect(() => {
    if (activePanel !== 'location') setLocationStepOverride(null);
  }, [activePanel]);

  useEffect(() => {
    if (activePanel !== 'property') setPropertyStepOverride(null);
  }, [activePanel]);

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
    startTransition(() => router.push(basePath));
    window.setTimeout(() => {
      suppressPriceSyncRef.current = false;
    }, 600);
  };

  const handleSaveFilterClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push(buildListingsLoginRedirectFromSearchParams(searchParams));
      return;
    }
    setSaveFilterOpen(true);
  }, [isAuthenticated, router, searchParams]);

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

  const propertyLabel = [selectedPropertyType?.name, selectedSubtype?.name]
    .filter(Boolean)
    .join(' · ');

  const transactionLabel = selectedTransaction?.display_name_ar || selectedTransaction?.name || '';

  const mapViewHref = useMemo(
    () => buildListingsHref(searchParams, {}, { basePath: '/listings/map' }),
    [searchParams],
  );

  const filterContent = (
    <>
      <div className="relative flex items-center justify-between gap-2 border-b border-gray-100/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-muted text-brand">
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-sm font-bold text-primary-dark">{t('filters.title')}</p>
            <p className="text-[11px] text-gray-500">
              {activeFilterCount > 0
                ? t('filters.refineActive').replace('{count}', String(activeFilterCount))
                : t('filters.refineHint')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {basePath === '/listings' ? (
            <Link
              href={mapViewHref}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-muted px-2.5 py-1.5 text-[11px] font-semibold text-brand-dark transition-colors hover:bg-brand/15"
            >
              <Map className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('map.mapView')}</span>
            </Link>
          ) : null}
          {pending ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden /> : null}
          {activeFilterCount > 0 ? (
            <>
              <button
                type="button"
                onClick={handleSaveFilterClick}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-muted px-2.5 py-1.5 text-[11px] font-semibold text-brand-dark transition-colors hover:bg-brand/15"
              >
                <Bookmark className="h-3.5 w-3.5" />
                {t('filters.saveFilter')}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100/90 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-200/90 hover:text-primary-dark"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t('filters.clearAll')}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {activeFilterCount > 0 || (selectedSubtype && hasFilterableSpecFields) ? (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100/80 bg-gray-50/40 px-4 py-3">
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
              onRemove={() => pushParams({ [LISTING_URL_PARAMS.neighborhood]: null })}
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
                const next = new URLSearchParams(searchParams.toString());
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
              onRemove={() => pushParams({ [LISTING_URL_PARAMS.transactionType]: null })}
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

      <div className="flex flex-wrap divide-x divide-gray-100 rtl:divide-x-reverse sm:flex-nowrap">
        <FilterSegment
          icon={MapPin}
          label={t('search.where')}
          value={locationLabel}
          hint={t('filters.anyLocation')}
          active={activePanel === 'location'}
          onClick={() => togglePanel('location')}
          className="min-w-[45%] flex-1 sm:min-w-0"
        />
        <FilterSegment
          icon={Building2}
          label={t('search.type')}
          value={propertyLabel}
          hint={t('filters.anyType')}
          active={activePanel === 'property'}
          onClick={() => togglePanel('property')}
          className="min-w-[45%] flex-1 sm:min-w-0"
        />
        <FilterSegment
          icon={KeyRound}
          label={t('filters.deal')}
          value={transactionLabel}
          hint={t('filters.allTransactions')}
          active={activePanel === 'transaction'}
          onClick={() => togglePanel('transaction')}
          className="min-w-[45%] flex-1 sm:min-w-0"
        />
        <FilterSegment
          icon={Wallet}
          label={t('search.budget')}
          value={budgetLabel}
          hint={t('filters.anyPrice')}
          active={activePanel === 'budget'}
          onClick={() => togglePanel('budget')}
          className="min-w-[45%] flex-1 sm:min-w-0"
        />
      </div>

      <FilterExpandPanel open={activePanel === 'location'}>
        {locationStep === 'city' ? (
          <CityPanel
            compact
            cities={catalog.cities}
            selectedId={selectedCity?.id ?? null}
            onSelect={(city) => {
              pushParams({
                [LISTING_URL_PARAMS.city]: city.pcode,
                [LISTING_URL_PARAMS.neighborhood]: null,
              });
              setLocationStepOverride('neighborhood');
            }}
          />
        ) : (
          <div>
            <DrillDownBack
              label={`${t('filters.changeCity')} · ${selectedCity?.name ?? ''}`}
              onClick={() => setLocationStepOverride('city')}
            />
            <NeighborhoodPanel
              compact
              loading={loadingNeighborhoods}
              neighborhoods={neighborhoods}
              selectedPcode={currentNeighborhood || null}
              onSelect={(neighborhood) =>
                pushParams({
                  [LISTING_URL_PARAMS.neighborhood]: neighborhood?.neighb_pcode ?? null,
                })
              }
            />
          </div>
        )}
      </FilterExpandPanel>

      <FilterExpandPanel open={activePanel === 'property'}>
        {propertyStep === 'type' ? (
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
              setPropertyStepOverride('subtype');
            }}
          />
        ) : (
          <div>
            <DrillDownBack
              label={`${t('filters.changePropertyType')} · ${selectedPropertyType?.name ?? ''}`}
              onClick={() => setPropertyStepOverride('type')}
            />
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-primary-dark">{t('filters.propertySubtype')}</p>
              {loadingSubtypes ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <SubtypeChip
                label={t('filters.allSubtypes')}
                selected={!currentPropertySubtype}
                onClick={() => {
                  const next = new URLSearchParams(searchParams.toString());
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
                    const next = new URLSearchParams(searchParams.toString());
                    next.set(LISTING_URL_PARAMS.propertySubtype, subtype.slug);
                    clearSpecFromSearchParams(next);
                    next.delete(LISTING_URL_PARAMS.cursor);
                    applySearchParams(next);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </FilterExpandPanel>

      <FilterExpandPanel open={activePanel === 'transaction'}>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => pushParams({ [LISTING_URL_PARAMS.transactionType]: null })}
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
              onClick={() => pushParams({ [LISTING_URL_PARAMS.transactionType]: type.slug })}
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

      <FilterExpandPanel open={activePanel === 'budget'}>
        <BudgetPanel
          compact
          minPrice={minPriceInput}
          maxPrice={maxPriceInput}
          onMinChange={setMinPriceInput}
          onMaxChange={setMaxPriceInput}
        />
      </FilterExpandPanel>
    </>
  );

  return (
    <div ref={barRef} className={className}>
      <div
        className={cn(
          'hidden overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-var(--shadow-soft) ring-1 ring-black/3 lg:block',
          pending && 'opacity-90',
        )}
      >
        {filterContent}
      </div>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-primary-dark shadow-var(--shadow-soft)"
        >
          <SlidersHorizontal className="h-4 w-4 text-brand" />
          {t('filters.openFilters')}
          {activeFilterCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.button
                type="button"
                aria-label={t('filters.closeSpec')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-primary-dark/20 backdrop-blur-[2px]"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-x-3 bottom-3 top-16 z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-var(--shadow-float)"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-bold text-primary-dark">{t('filters.openFilters')}</p>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">{filterContent}</div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>

      <SpecFiltersPanel
        open={specOpen}
        schema={selectedSubtype?.spec_schema ?? null}
        searchParams={searchParams}
        onClose={() => setSpecOpen(false)}
        onApply={applySearchParams}
      />

      <SaveFavoriteFilterModal
        open={saveFilterOpen}
        filters={serializeListingFiltersFromSearchParams(searchParams)}
        onClose={() => setSaveFilterOpen(false)}
      />
    </div>
  );
}
