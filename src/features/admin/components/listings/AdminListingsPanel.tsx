'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, Home, Loader2, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { TogglePill } from '@/components/ui/toggle-pill';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ListingTable } from '@/features/admin/components/listings/ListingTable';
import { ListingCard } from '@/features/admin/components/listings/ListingCard';
import { draftListing, softDeleteListing, restoreListing, hardDeleteListing } from '@/features/listings/services/listing-client';
import { loadMoreAdminListings } from '@/features/listings/services/admin-listings-client';
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
  'h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40';

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

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setListings(initial.items);
    setNextCursor(initial.next_cursor);
    setHasMore(initial.has_more);
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
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-xl">
                <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('admin.searchUsers')}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 ps-9 pe-3 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={fieldClass}>
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
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={propertyTypeId}
                onChange={(e) => void handlePropertyTypeChange(e.target.value)}
                className={fieldClass}
              >
                <option value="">{t('dashboard.listings.propertyType')}</option>
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
                className={fieldClass}
              >
                <option value="">{t('dashboard.listings.propertySubtype')}</option>
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
                <option value="">{t('dashboard.listings.transactionType')}</option>
                {transactionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.display_name_ar || type.name}
                  </option>
                ))}
              </select>

              <select value={cityId} onChange={(e) => void handleCityChange(e.target.value)} className={fieldClass}>
                <option value="">{t('admin.city')}</option>
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
                className={fieldClass}
              >
                <option value="">{t('dashboard.neighborhood')}</option>
                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <SearchableSelect
                value={officeId}
                selectedLabel={officeLabel}
                onChange={handleOfficeChange}
                fetchOptions={searchOfficesForSelect}
                placeholder={t('admin.searchOffice')}
                className="w-full sm:w-64"
              />

              <SearchableSelect
                value={individualListerId}
                selectedLabel={individualListerLabel}
                onChange={handleIndividualListerChange}
                fetchOptions={searchIndividualListersForSelect}
                placeholder={t('admin.searchIndividualLister')}
                className="w-full sm:w-64"
              />
            </div>
          </div>
        }
      />

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
          <p className="text-gray-500">{t('dashboard.listings.empty')}</p>
        </div>
      ) : (
        <>
          <ListingTable listings={listings} {...actionProps} />
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
    </div>
  );
}
