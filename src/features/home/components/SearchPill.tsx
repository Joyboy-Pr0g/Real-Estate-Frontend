'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, MapPin, Search, Wallet } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  PublicCatalog,
  PublicCity,
  PublicPropertyType,
  PublicTransactionType,
} from '@/features/catalog/types/catalog';
import { getTransactionLabel } from '@/features/catalog/utils/catalog-icons';
import { buildListingsUrl } from '@/features/listings/lib/build-listings-url';
import { CityPanel } from '@/features/home/components/search/CityPanel';
import { PropertyTypePanel } from '@/features/home/components/search/PropertyTypePanel';
import { BudgetPanel } from '@/features/home/components/search/BudgetPanel';
import { SearchModal } from '@/features/home/components/search/SearchModal';
import { useLocale } from '@/lib/i18n/locale-provider';
import { EASE_OUT_EXPO } from '@/lib/motion/reveal';
import { cn } from '@/lib/utils/cn';

type PanelId = 'where' | 'type' | 'budget';

interface SearchPillProps {
  catalog: PublicCatalog;
  className?: string;
  compact?: boolean;
}

interface SearchFilters {
  city: PublicCity | null;
  propertyType: PublicPropertyType | null;
  transactionType: PublicTransactionType | null;
  minPrice: string;
  maxPrice: string;
}

function pickToggleTransactionTypes(types: PublicTransactionType[]) {
  const sale = types.find((type) => type.icon === 'sale' || type.slug.includes('sale'));
  const rent = types.find((type) => type.icon === 'rent' || type.slug.includes('rent'));
  return [sale, rent].filter((type): type is PublicTransactionType => Boolean(type));
}

export function SearchPill({ catalog, className, compact = false }: SearchPillProps) {
  const router = useRouter();
  const { t, locale } = useLocale();

  const toggleTransactionTypes = useMemo(
    () => pickToggleTransactionTypes(catalog.transactionTypes),
    [catalog.transactionTypes],
  );

  const defaultTransaction = toggleTransactionTypes[0] ?? catalog.transactionTypes[0] ?? null;

  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    city: null,
    propertyType: null,
    transactionType: defaultTransaction,
    minPrice: '',
    maxPrice: '',
  });

  const closePanel = useCallback(() => setActivePanel(null), []);

  const togglePanel = (id: PanelId) => {
    setActivePanel((current) => (current === id ? null : id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.push(
      buildListingsUrl({
        cityPcode: filters.city?.pcode,
        propertyTypeSlug: filters.propertyType?.slug,
        transactionTypeSlug: filters.transactionType?.slug,
        minPrice: filters.minPrice.trim() || undefined,
        maxPrice: filters.maxPrice.trim() || undefined,
      }),
    );
    closePanel();
  };

  const panelTitles: Record<PanelId, string> = {
    where: t('search.where'),
    type: t('search.type'),
    budget: t('search.budget'),
  };

  const renderPanelContent = () => {
    if (activePanel === 'where') {
      return (
        <CityPanel
          cities={catalog.cities}
          selectedId={filters.city?.id ?? null}
          onSelect={(city) => {
            setFilters((f) => ({ ...f, city }));
            setActivePanel('type');
          }}
        />
      );
    }

    if (activePanel === 'type') {
      return (
        <PropertyTypePanel
          propertyTypes={catalog.propertyTypes}
          selectedId={filters.propertyType?.id ?? null}
          onSelect={(propertyType) => {
            setFilters((f) => ({ ...f, propertyType }));
            setActivePanel('budget');
          }}
        />
      );
    }

    if (activePanel === 'budget') {
      return (
        <BudgetPanel
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinChange={(minPrice) => setFilters((f) => ({ ...f, minPrice }))}
          onMaxChange={(maxPrice) => setFilters((f) => ({ ...f, maxPrice }))}
        />
      );
    }

    return null;
  };

  return (
    <>
      <div
        className={cn(
          'relative w-full max-w-[920px] mx-auto',
          activePanel && 'z-[10000]',
          className,
        )}
      >
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.15 }}
          className={cn(
            'relative overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[var(--shadow-float)]',
            compact && 'rounded-xl',
          )}
        >
          {toggleTransactionTypes.length > 0 ? (
            <div className="flex border-b border-gray-100">
              {toggleTransactionTypes.map((tx) => {
                const selected = filters.transactionType?.id === tx.id;
                return (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, transactionType: tx }))}
                    className={cn(
                      'relative flex-1 py-3 text-sm font-semibold transition-colors',
                      selected ? 'text-brand' : 'text-gray-500 hover:text-gray-700',
                      compact && 'py-2.5 text-xs',
                    )}
                  >
                    {getTransactionLabel(tx, locale)}
                    {selected ? (
                      <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-brand" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div
            className={cn(
              'flex flex-col gap-2 sm:flex-row sm:items-stretch',
              compact ? 'p-2.5' : 'p-3 md:p-4',
            )}
          >
            <button
              type="button"
              onClick={() => togglePanel('where')}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/60 text-start transition-colors hover:border-brand/30 hover:bg-brand-muted/40',
                'outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
                compact ? 'px-3 py-2.5' : 'px-4 py-3 sm:border-0 sm:bg-transparent sm:hover:bg-gray-50',
              )}
            >
              <MapPin className={cn('shrink-0 text-brand', compact ? 'h-4 w-4' : 'h-5 w-5')} strokeWidth={2.2} />
              <div className="min-w-0">
                <span className={cn('block font-semibold text-gray-500', compact ? 'text-[10px]' : 'text-xs')}>
                  {t('search.where')}
                </span>
                <span
                  className={cn(
                    'block truncate',
                    compact ? 'text-sm' : 'text-sm md:text-base',
                    filters.city ? 'font-semibold text-primary-dark' : 'text-gray-400',
                  )}
                >
                  {filters.city?.name ?? t('search.whereHint')}
                </span>
              </div>
            </button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand font-bold text-white transition-colors hover:bg-brand-dark',
                compact ? 'h-11 px-5 text-sm' : 'h-12 px-6 text-sm md:h-[52px] md:px-8 md:text-base',
              )}
            >
              <Search className={compact ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={2.5} />
              {t('hero.search')}
            </motion.button>
          </div>

          <div className="flex divide-x divide-gray-100 border-t border-gray-100">
            <button
              type="button"
              onClick={() => togglePanel('type')}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2 px-4 py-2.5 text-start transition-colors hover:bg-gray-50',
                activePanel === 'type' && 'bg-brand-muted/30',
                compact && 'px-3 py-2',
              )}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0 text-brand/80" strokeWidth={2.2} />
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  {t('search.type')}
                </span>
                <span
                  className={cn(
                    'block truncate text-xs font-medium',
                    filters.propertyType ? 'text-primary-dark' : 'text-gray-400',
                  )}
                >
                  {filters.propertyType?.name ?? t('search.typeHint')}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => togglePanel('budget')}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2 px-4 py-2.5 text-start transition-colors hover:bg-gray-50',
                activePanel === 'budget' && 'bg-brand-muted/30',
                compact && 'px-3 py-2',
              )}
            >
              <Wallet className="h-3.5 w-3.5 shrink-0 text-brand/80" strokeWidth={2.2} />
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  {t('search.budget')}
                </span>
                <span
                  className={cn(
                    'block truncate text-xs font-medium',
                    filters.minPrice || filters.maxPrice ? 'text-primary-dark' : 'text-gray-400',
                  )}
                >
                  {filters.minPrice || filters.maxPrice
                    ? [filters.minPrice, filters.maxPrice].filter(Boolean).join(' – ')
                    : t('search.budgetHint')}
                </span>
              </div>
            </button>
          </div>
        </motion.form>
      </div>

      <SearchModal
        open={activePanel !== null}
        title={activePanel ? panelTitles[activePanel] : undefined}
        onClose={closePanel}
      >
        {renderPanelContent()}
      </SearchModal>
    </>
  );
}
