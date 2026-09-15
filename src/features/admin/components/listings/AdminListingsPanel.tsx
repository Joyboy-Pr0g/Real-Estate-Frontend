'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Building2, Home, Loader2, MapPin, Search, UserRound, X } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { TogglePill } from '@/components/ui/toggle-pill';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ListingTable } from '@/features/admin/components/listings/ListingTable';
import { ListingCard } from '@/features/admin/components/listings/ListingCard';
import { draftListing, softDeleteListing, restoreListing, hardDeleteListing, bulkDeleteListings } from '@/features/listings/services/listing-client';
import { loadMoreAdminListings } from '@/features/listings/services/admin-listings-client';
// import { AdminAuditTrigger } from '@/features/admin/components/audit/AdminAuditTrigger';
import { useAdminLatestActions } from '@/features/admin/hooks/use-admin-latest-actions';
import { AdminListingsPage, AdminListingSummary, PublicListing } from '@/features/listings/types/listing';
import { PublicCity, PublicPropertyType, PublicTransactionType } from '@/features/catalog/types/catalog';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { searchOfficesForSelect } from '@/features/office/services/admin-offices-client';
import { searchIndividualListersForSelect } from '@/features/individual-lister/services/admin-individual-listers-client';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import type { TranslationKey } from '@/lib/i18n/ar';

const STATUSES: PublicListing['status'][] = ['draft', 'published', 'sold', 'rented'];
const PAGE_SIZE = 20;

interface AdminListingsPanelProps {
  initial: AdminListingsPage;
  propertyTypes: PublicPropertyType[];
  transactionTypes: PublicTransactionType[];
  cities: PublicCity[];
  initialSubtypes: PublicPropertySubtype[];
  initialNeighborhoods: PublicNeighborhood[];
  initialStatus?: PublicListing['status'];
  initialSearch?: string;
  initialPropertyTypeId?: string;
  initialPropertySubtypeId?: string;
  initialTransactionTypeId?: string;
  initialCityId?: string;
  initialNeighborhoodId?: string;
  initialOfficeId?: string;
  initialOfficeLabel?: string;
  initialIndividualListerId?: string;
  initialIndividualListerLabel?: string;
  initialIncludeDeleted?: boolean;
}

type ConfirmAction = 'soft_delete' | 'hard_delete';

const fieldClass =
  'h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/10';

const searchClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 ps-10 pe-3 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/10';

function FilterGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Building2;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-100 bg-linear-to-b from-gray-50/80 to-white p-3.5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm ring-1 ring-gray-100">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

export function AdminListingsPanel({
  initial,
  propertyTypes,
  transactionTypes,
  cities,
  initialSubtypes,
  initialNeighborhoods,
  initialStatus,
  initialSearch = '',
  initialPropertyTypeId = '',
  initialPropertySubtypeId = '',
  initialTransactionTypeId = '',
  initialCityId = '',
  initialNeighborhoodId = '',
  initialOfficeId = '',
  initialOfficeLabel = '',
  initialIndividualListerId = '',
  initialIndividualListerLabel = '',
  initialIncludeDeleted = false,
}: AdminListingsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const [isPending, startTransition] = useTransition();
  const isInitialRender = useRef(true);

  const [listings, setListings] = useState(initial.items);
  const [nextCursor, setNextCursor] = useState(initial.next_cursor);
  const [hasMore, setHasMore] = useState(initial.has_more);
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? '');
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [includeDeleted, setIncludeDeleted] = useState(initialIncludeDeleted);

  const [propertyTypeId, setPropertyTypeId] = useState(initialPropertyTypeId);
  const [propertySubtypeId, setPropertySubtypeId] = useState(initialPropertySubtypeId);
  const [subtypes, setSubtypes] = useState<PublicPropertySubtype[]>(initialSubtypes);
  const [loadingSubtypes, setLoadingSubtypes] = useState(false);
  const [transactionTypeId, setTransactionTypeId] = useState(initialTransactionTypeId);
  const [cityId, setCityId] = useState(initialCityId);
  const [neighborhoodId, setNeighborhoodId] = useState(initialNeighborhoodId);
  const [neighborhoods, setNeighborhoods] = useState<PublicNeighborhood[]>(initialNeighborhoods);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [officeId, setOfficeId] = useState(initialOfficeId);
  const [officeLabel, setOfficeLabel] = useState(initialOfficeLabel);
  const [individualListerId, setIndividualListerId] = useState(initialIndividualListerId);
  const [individualListerLabel, setIndividualListerLabel] = useState(initialIndividualListerLabel);

  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmListing, setConfirmListing] = useState<AdminListingSummary | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>('soft_delete');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [canSelect, setCanSelect] = useState(false);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const latestActions = useAdminLatestActions(
    'listing',
    listings.map((listing) => listing.id),
    listings.length,
  );

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setListings(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
    setSelected(new Set());
  }

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (propertyTypeId) params.set('property_type_id', propertyTypeId);
    if (propertySubtypeId) params.set('property_subtype_id', propertySubtypeId);
    if (transactionTypeId) params.set('transaction_type_id', transactionTypeId);
    if (cityId) params.set('city_id', cityId);
    if (neighborhoodId) params.set('neighborhood_id', neighborhoodId);
    if (officeId) params.set('office_id', officeId);
    if (individualListerId) params.set('individual_lister_id', individualListerId);
    if (includeDeleted) params.set('include_deleted', 'true');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }, [
    pathname,
    router,
    statusFilter,
    debouncedSearch,
    propertyTypeId,
    propertySubtypeId,
    transactionTypeId,
    cityId,
    neighborhoodId,
    officeId,
    individualListerId,
    includeDeleted,
  ]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    applyFilters();
  }, [applyFilters]);

  const handlePropertyTypeChange = async (value: string) => {
    setPropertyTypeId(value);
    setPropertySubtypeId('');
    setSubtypes([]);
    if (!value) return;

    setLoadingSubtypes(true);
    try {
      const res = await clientFetch<PublicPropertySubtype[]>(bffPaths.propertySubtypes.byPropertyType(value));
      setSubtypes(res.data ?? []);
    } catch {
      setSubtypes([]);
    } finally {
      setLoadingSubtypes(false);
    }
  };

  const handleCityChange = async (value: string) => {
    setCityId(value);
    setNeighborhoodId('');
    setNeighborhoods([]);
    if (!value) return;

    setLoadingNeighborhoods(true);
    try {
      const res = await clientFetch<PublicNeighborhood[]>(bffPaths.neighborhoods.public, {
        params: { city_id: value },
      });
      setNeighborhoods(res.data ?? []);
    } catch {
      setNeighborhoods([]);
    } finally {
      setLoadingNeighborhoods(false);
    }
  };

  const handleOfficeChange = (id: string, label: string) => {
    setOfficeId(id);
    setOfficeLabel(label);
  };

  const handleIndividualListerChange = (id: string, label: string) => {
    setIndividualListerId(id);
    setIndividualListerLabel(label);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter) count += 1;
    if (debouncedSearch.trim()) count += 1;
    if (propertyTypeId) count += 1;
    if (propertySubtypeId) count += 1;
    if (transactionTypeId) count += 1;
    if (cityId) count += 1;
    if (neighborhoodId) count += 1;
    if (officeId) count += 1;
    if (individualListerId) count += 1;
    if (includeDeleted) count += 1;
    return count;
  }, [
    statusFilter,
    debouncedSearch,
    propertyTypeId,
    propertySubtypeId,
    transactionTypeId,
    cityId,
    neighborhoodId,
    officeId,
    individualListerId,
    includeDeleted,
  ]);

  const clearAllFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setPropertyTypeId('');
    setPropertySubtypeId('');
    setSubtypes([]);
    setTransactionTypeId('');
    setCityId('');
    setNeighborhoodId('');
    setNeighborhoods([]);
    setOfficeId('');
    setOfficeLabel('');
    setIndividualListerId('');
    setIndividualListerLabel('');
    setIncludeDeleted(false);
    router.push(pathname);
  };

  const refreshList = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const runAction = async (id: string, action: () => Promise<void>, successMessage?: string) => {
    setActionId(id);
    try {
      await action();
      refreshList();
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionId(null);
      setConfirmOpen(false);
      setConfirmListing(null);
    }
  };

  const openConfirm = (listing: AdminListingSummary, action: ConfirmAction) => {
    setConfirmListing(listing);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!confirmListing) return;
    if (confirmAction === 'hard_delete') {
      void runAction(confirmListing.id, () => hardDeleteListing(confirmListing.id), t('dashboard.listings.softDeleted'));
      return;
    }
    void runAction(confirmListing.id, () => softDeleteListing(confirmListing.id), t('dashboard.listings.softDeleted'));
  };

  const loadMore = () => {
    if (!nextCursor) return;
    startTransition(async () => {
      const params: Record<string, string> = { cursor: nextCursor, limit: String(PAGE_SIZE) };
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (propertyTypeId) params.property_type_id = propertyTypeId;
      if (propertySubtypeId) params.property_subtype_id = propertySubtypeId;
      if (transactionTypeId) params.transaction_type_id = transactionTypeId;
      if (cityId) params.city_id = cityId;
      if (neighborhoodId) params.neighborhood_id = neighborhoodId;
      if (officeId) params.office_id = officeId;
      if (individualListerId) params.individual_lister_id = individualListerId;
      if (includeDeleted) params.include_deleted = 'true';

      const page = await loadMoreAdminListings(params);
      setListings((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
      setHasMore(page.has_more);
    });
  };

  const actionProps = {
    actionId,
    onDraft: (listing: AdminListingSummary) =>
      void runAction(listing.id, () => draftListing(listing.id), t('dashboard.listings.drafted')),
    onSoftDelete: (listing: AdminListingSummary) => openConfirm(listing, 'soft_delete'),
    onRestore: (listing: AdminListingSummary) =>
      void runAction(listing.id, () => restoreListing(listing.id), t('admin.listingRestored')),
    onHardDelete: (listing: AdminListingSummary) => openConfirm(listing, 'hard_delete'),
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === listings.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(listings.map((listing) => listing.id)));
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const deleted = await bulkDeleteListings([...selected]);
      toast.success(t('admin.bulkHardDeleted').replace('{count}', String(deleted)));
      setSelected(new Set());
      setBulkConfirmOpen(false);
      refreshList();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className={cn('space-y-6 transition-opacity', isPending && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.listings', icon: Home },
        ]}
        title={t('admin.listings')}
        countLabel={t('admin.usersCount').replace('{count}', String(listings.length))}
        filters={
          <div className="space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
              <label className="relative min-w-0 flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute inset-s-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  strokeWidth={1.75}
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('admin.searchListings')}
                  className={searchClass}
                />
              </label>

              <div className="flex flex-wrap items-center gap-2 xl:max-w-md xl:justify-end">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={cn(fieldClass, 'min-w-35 flex-1 sm:flex-none')}
                  aria-label={t('admin.filterStatus')}
                >
                  <option value="">{t('dashboard.listings.allStatuses')}</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t(`dashboard.listings.status.${status}` as TranslationKey)}
                    </option>
                  ))}
                </select>

                <TogglePill
                  checked={includeDeleted}
                  onCheckedChange={setIncludeDeleted}
                  label={t('admin.includeDeleted')}
                  icon={<Archive size={15} />}
                />

                {hasPermission('listings.bulk_delete') ? (
                  !canSelect ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCanSelect(true)}
                      className="hidden shrink-0 rounded-xl sm:inline-flex"
                    >
                      {t('admin.select')}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCanSelect(false)}
                      className="hidden shrink-0 rounded-xl sm:inline-flex"
                    >
                      {t('admin.unSelect')}
                    </Button>
                  )
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <FilterGroup title={t('admin.propertyTypes')} icon={Building2}>
                <select
                  value={propertyTypeId}
                  onChange={(e) => void handlePropertyTypeChange(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">{t('filters.allPropertyTypes')}</option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>

                <select
                  value={propertySubtypeId}
                  onChange={(e) => setPropertySubtypeId(e.target.value)}
                  disabled={!propertyTypeId || loadingSubtypes}
                  className={cn(fieldClass, 'disabled:cursor-not-allowed disabled:opacity-50')}
                >
                  <option value="">{t('filters.allSubtypes')}</option>
                  {subtypes.map((subtype) => (
                    <option key={subtype.id} value={subtype.id}>
                      {subtype.name}
                    </option>
                  ))}
                </select>

                <select
                  value={transactionTypeId}
                  onChange={(e) => setTransactionTypeId(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">{t('filters.allTransactions')}</option>
                  {transactionTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.display_name_ar || type.name}
                    </option>
                  ))}
                </select>
              </FilterGroup>

              <FilterGroup title={t('filters.city')} icon={MapPin}>
                <select
                  value={cityId}
                  onChange={(e) => void handleCityChange(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">{t('filters.allCities')}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>

                <select
                  value={neighborhoodId}
                  onChange={(e) => setNeighborhoodId(e.target.value)}
                  disabled={!cityId || loadingNeighborhoods}
                  className={cn(fieldClass, 'disabled:cursor-not-allowed disabled:opacity-50')}
                >
                  <option value="">{t('filters.allNeighborhoods')}</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood.id} value={neighborhood.id}>
                      {neighborhood.name}
                    </option>
                  ))}
                </select>
              </FilterGroup>

              <FilterGroup title={t('admin.seller')} icon={UserRound}>
                <SearchableSelect
                  value={officeId}
                  selectedLabel={officeLabel}
                  onChange={handleOfficeChange}
                  fetchOptions={searchOfficesForSelect}
                  placeholder={t('admin.searchOffice')}
                  className="w-full"
                />

                <SearchableSelect
                  value={individualListerId}
                  selectedLabel={individualListerLabel}
                  onChange={handleIndividualListerChange}
                  fetchOptions={searchIndividualListersForSelect}
                  placeholder={t('admin.searchIndividualLister')}
                  className="w-full"
                />
              </FilterGroup>
            </div>

            {activeFilterCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand/15 bg-brand-muted/40 px-3 py-2.5">
                <p className="text-sm text-brand-dark">
                  {t('filters.refineActive').replace('{count}', String(activeFilterCount))}
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-dark transition-colors hover:bg-white/80"
                >
                  <X className="h-3.5 w-3.5" />
                  {t('filters.clearAll')}
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400">{t('filters.refineHint')}</p>
            )}
          </div>
        }
      />

      {selected.size > 0 && hasPermission('listings.bulk_delete') ? (
        <Button variant="dangerOutline" onClick={() => void handleBulkDelete()} className="rounded-xl">
          {t('admin.deleteSelected').replace('{count}', String(selected.size))}
        </Button>
      ) : null}

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-var(--shadow-soft)">
          <p className="text-gray-500">{t('dashboard.listings.empty')}</p>
        </div>
      ) : (
        <>
          <ListingTable
            listings={listings}
            latestActions={latestActions}
            selectable={canSelect}
            selectedIds={selected}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            {...actionProps}
          />
          <div className="space-y-3 lg:hidden">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} {...actionProps} />
            ))}
          </div>
        </>
      )}

      {hasMore ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isPending} className="rounded-xl">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('admin.loadMore')}
          </Button>
        </div>
      ) : null}

      {confirmListing ? (
        <ConfirmModal
          open={confirmOpen}
          title={t('admin.confirmTitle').replace('{name}', confirmListing.title)}
          description={
            confirmAction === 'hard_delete'
              ? t('admin.confirmHardDelete').replace('{name}', confirmListing.title)
              : t('admin.confirmSoftDelete').replace('{name}', confirmListing.title)
          }
          confirmText={confirmAction === 'hard_delete' ? t('admin.hardDelete') : t('admin.softDelete')}
          cancelText={t('admin.cancel')}
          loading={actionId === confirmListing.id}
          danger
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmListing(null);
          }}
          onConfirm={handleConfirm}
        />
      ) : null}

      <ConfirmModal
        open={bulkConfirmOpen}
        title={t('admin.confirmBulkHardDeleteTitle')}
        description={t('admin.confirmBulkHardDeleteDescription').replace('{count}', String(selected.size))}
        confirmText={t('admin.hardDelete')}
        cancelText={t('admin.cancel')}
        danger
        loading={bulkDeleting}
        onCancel={() => setBulkConfirmOpen(false)}
        onConfirm={() => void handleBulkDelete()}
      />
    </div>
  );
}
