'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, ChevronDown, MapPin, Search, Wallet } from 'lucide-react';
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
type SearchPillVariant = 'default' | 'hero-row';

interface SearchPillProps {
  catalog: PublicCatalog;
  className?: string;
  compact?: boolean;
  variant?: SearchPillVariant;
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

function SearchField({
  label,
  value,
  placeholder,
  icon: Icon,
  active,
  onClick,
  heroRow,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: typeof MapPin;
  active?: boolean;
  onClick: () => void;
  heroRow?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-w-0 flex-1 items-center gap-3 text-start transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
        heroRow
          ? 'px-4 py-3.5 hover:bg-gray-50 md:px-5 md:py-4'
          : cn(
              'rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 hover:border-brand/30 hover:bg-brand-muted/40 sm:border-0 sm:bg-transparent sm:hover:bg-gray-50',
            ),
        active && !heroRow && 'border-brand/30 bg-brand-muted/40',
        active && heroRow && 'bg-brand-muted/25',
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-brand" strokeWidth={2.2} />
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
        <span
          className={cn(
            'block truncate text-sm md:text-base',
            value ? 'font-semibold text-primary-dark' : 'text-gray-400',
          )}
        >
          {value || placeholder}
        </span>
      </div>
      {heroRow ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" /> : null}
    </button>
  );
}

export function SearchPill({
  catalog,
  className,
  compact = false,
  variant = 'default',
}: SearchPillProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isHeroRow = variant === 'hero-row';

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

  const budgetLabel =
    filters.minPrice || filters.maxPrice
      ? [filters.minPrice, filters.maxPrice].filter(Boolean).join(' – ')
      : '';

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

  const transactionTabs =
    toggleTransactionTypes.length > 0 ? (
      <div
        className={cn(
          'flex gap-2',
          isHeroRow ? 'mb-4 justify-center md:justify-start' : 'border-b border-gray-100',
        )}
      >
        {toggleTransactionTypes.map((tx) => {
          const selected = filters.transactionType?.id === tx.id;
          return (
            <button
              key={tx.id}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, transactionType: tx }))}
              className={cn(
                'relative font-semibold transition-colors',
                isHeroRow
                  ? cn(
                      'rounded-full px-4 py-1.5 text-sm',
                      selected
                        ? 'bg-white text-brand shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )
                  : cn(
                      'flex-1 py-3 text-sm',
                      selected ? 'text-brand' : 'text-gray-500 hover:text-gray-700',
                      compact && 'py-2.5 text-xs',
                    ),
              )}
            >
              {getTransactionLabel(tx, locale)}
              {!isHeroRow && selected ? (
                <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-brand" />
              ) : null}
            </button>
          );
        })}
      </div>
    ) : null;

  const searchButton = (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-brand font-bold text-white transition-colors hover:bg-brand-dark',
        isHeroRow
          ? 'h-12 w-12 rounded-full md:h-14 md:w-14'
          : cn(
              'gap-2 rounded-xl',
              compact ? 'h-11 px-5 text-sm' : 'h-12 px-6 text-sm md:h-[52px] md:px-8 md:text-base',
            ),
      )}
      aria-label={t('hero.search')}
    >
      <Search className={isHeroRow ? 'h-5 w-5 md:h-6 md:w-6' : compact ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={2.5} />
      {!isHeroRow ? t('hero.search') : null}
    </motion.button>
  );

  return (
    <>
      <div
        className={cn(
          'relative w-full mx-auto',
          isHeroRow ? 'max-w-5xl' : 'max-w-[920px]',
          activePanel && 'z-[10000]',
          className,
        )}
      >
        {isHeroRow ? transactionTabs : null}

        <motion.form
          onSubmit={handleSubmit}
          initial={isHeroRow ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={isHeroRow ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.15 }}
          className={cn(
            'relative overflow-hidden bg-white shadow-[var(--shadow-float)]',
            isHeroRow
              ? 'rounded-2xl border border-white/30 md:rounded-full md:p-2'
              : cn('rounded-2xl border border-white/20', compact && 'rounded-xl'),
          )}
        >
          {!isHeroRow ? transactionTabs : null}

          {isHeroRow ? (
            <div className="flex flex-col md:flex-row md:items-center">
              <SearchField
                heroRow
                label={t('search.where')}
                value={filters.city?.name ?? ''}
                placeholder={t('search.whereHint')}
                icon={MapPin}
                active={activePanel === 'where'}
                onClick={() => togglePanel('where')}
              />
              <div className="hidden h-10 w-px shrink-0 bg-gray-200 md:block" />
              <SearchField
                heroRow
                label={t('search.type')}
                value={filters.propertyType?.name ?? ''}
                placeholder={t('search.typeHint')}
                icon={Building2}
                active={activePanel === 'type'}
                onClick={() => togglePanel('type')}
              />
              <div className="hidden h-10 w-px shrink-0 bg-gray-200 md:block" />
              <SearchField
                heroRow
                label={t('search.budget')}
                value={budgetLabel}
                placeholder={t('search.budgetHint')}
                icon={Wallet}
                active={activePanel === 'budget'}
                onClick={() => togglePanel('budget')}
              />
              <div className="border-t border-gray-100 p-3 md:border-0 md:p-0 md:pe-2 md:ps-1">
                {searchButton}
              </div>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  'flex flex-col gap-2 sm:flex-row sm:items-stretch',
                  compact ? 'p-2.5' : 'p-3 md:p-4',
                )}
              >
                <SearchField
                  label={t('search.where')}
                  value={filters.city?.name ?? ''}
                  placeholder={t('search.whereHint')}
                  icon={MapPin}
                  active={activePanel === 'where'}
                  onClick={() => togglePanel('where')}
                />
                {searchButton}
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
                        budgetLabel ? 'text-primary-dark' : 'text-gray-400',
                      )}
                    >
                      {budgetLabel || t('search.budgetHint')}
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}
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
