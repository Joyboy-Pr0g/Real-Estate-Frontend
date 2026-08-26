'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Eye, Bookmark, Plus, Search } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { toast } from '@/components/ui/toaster';
import { MyListingsActionsMenu } from '@/features/listings/components/dashboard/MyListingsActionsMenu';
import { MyListingSummary, PublicListing } from '@/features/listings/types/listing';
import { PublicCity, PublicPropertyType, PublicTransactionType } from '@/features/catalog/types/catalog';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { createSearchMyOfficesForSelect } from '@/features/office/services/office-client';
import { MyOffice } from '@/features/office/types/office';
import {
  draftListing,
  markListingRented,
  markListingSold,
  publishListing,
  softDeleteListing,
} from '@/features/listings/services/listing-client';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatPriceYER } from '@/lib/utils/currency';
import { cn } from '@/lib/utils/cn';
import { useDebounce } from '@/lib/hooks/use-debounce';
import type { TranslationKey } from '@/lib/i18n/ar';

interface MyListingsPanelProps {
  initialItems: MyListingSummary[];
  initialCursor: string | null;
  initialHasMore: boolean;
  basePath?: string;
  propertyTypes: PublicPropertyType[];
  transactionTypes: PublicTransactionType[];
  cities: PublicCity[];
  initialSubtypes: PublicPropertySubtype[];
  initialNeighborhoods: PublicNeighborhood[];
  initialSearch?: string;
  enableOfficeFilter?: boolean;
  myOffices?: MyOffice[];
  initialOfficeId?: string;
  initialOfficeLabel?: string;
}

interface CursorApiResponse {
  success: boolean;
  data: MyListingSummary[];
  next_cursor: string | null;
  has_more: boolean;
  message?: string;
}

const STATUS_STYLES: Record<PublicListing['status'], string> = {
  draft: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  published: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  sold: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  rented: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
};

const fieldClass = 'h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand/40';

interface MyListingCardProps {
  listing: MyListingSummary;
  basePath: string;
  actionId: string | null;
  onPublish: () => void;
  onDraft: () => void;
  onMarkSold: () => void;
  onMarkRented: () => void;
  onSoftDelete: () => void;
}

function MyListingCard({
  listing,
  basePath,
  actionId,
  onPublish,
  onDraft,
  onMarkSold,
  onMarkRented,
  onSoftDelete,
}: MyListingCardProps) {
  const { t } = useLocale();
  const detailHref = `${basePath}/${listing.id}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)]">
      <div className="relative aspect-[16/10] w-full bg-gray-100">
        <Link href={detailHref} className="block h-full w-full">
          {listing.main_photo ? (
            <Image
              src={listing.main_photo}
              alt={listing.title}
              fill
              className="object-cover transition-opacity hover:opacity-95"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <Building2 className="h-10 w-10" />
            </div>
          )}
        </Link>

        <div className="absolute top-3 end-3">
          <MyListingsActionsMenu
            listing={listing}
            editHref={`${basePath}/${listing.id}/edit`}
            viewHref={detailHref}
            disabled={actionId === listing.id}
            onPublish={onPublish}
            onDraft={onDraft}
            onMarkSold={onMarkSold}
            onMarkRented={onMarkRented}
            onSoftDelete={onSoftDelete}
          />
        </div>

        <span
          className={cn(
            'absolute bottom-3 start-3 rounded-full px-2.5 py-1 text-xs font-semibold',
            STATUS_STYLES[listing.status],
          )}
        >
          {t(`dashboard.listings.status.${listing.status}` as TranslationKey)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <Link href={detailHref} className="line-clamp-2 text-base font-bold text-primary-dark hover:text-brand-dark">
            {listing.title}
          </Link>
          <p className="truncate text-xs text-gray-500">
            {listing.neighborhood_name}, {listing.city_name}
          </p>
        </div>

        <p className="text-lg font-bold text-brand-dark">{formatPriceYER(listing.price)}</p>

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-400">{t('dashboard.listings.views')}</p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark">
              <Eye className="h-4 w-4 text-gray-400" />
              {listing.view_count}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-400">{t('dashboard.listings.saves')}</p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark">
              <Bookmark className="h-4 w-4 text-gray-400" />
              {listing.save_count}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MyListingsPanel({
  initialItems,
  initialCursor,
  initialHasMore,
  basePath = '/dashboard/listings',
  propertyTypes,
  transactionTypes,
  cities,
  initialSubtypes,
  initialNeighborhoods,
  initialSearch = '',
  enableOfficeFilter = false,
  myOffices = [],
  initialOfficeLabel = '',
}: MyListingsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const isInitialSearchSync = useRef(true);

  const [officeLabel, setOfficeLabel] = useState(initialOfficeLabel);
  const fetchOfficeOptions = useMemo(() => createSearchMyOfficesForSelect(myOffices), [myOffices]);

  const [prevOfficeLabel, setPrevOfficeLabel] = useState(initialOfficeLabel);
  if (initialOfficeLabel !== prevOfficeLabel) {
    setPrevOfficeLabel(initialOfficeLabel);
    setOfficeLabel(initialOfficeLabel);
  }

  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const status = searchParams.get('status') ?? '';
  const propertyTypeId = searchParams.get('property_type_id') ?? '';
  const propertySubtypeId = searchParams.get('property_subtype_id') ?? '';
  const transactionTypeId = searchParams.get('transaction_type_id') ?? '';
  const cityId = searchParams.get('city_id') ?? '';
  const neighborhoodId = searchParams.get('neighborhood_id') ?? '';
  const officeId = searchParams.get('office_id') ?? '';

  const [subtypes, setSubtypes] = useState<PublicPropertySubtype[]>(initialSubtypes);
  const [loadingSubtypes, setLoadingSubtypes] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<PublicNeighborhood[]>(initialNeighborhoods);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  const [prevItems, setPrevItems] = useState(initialItems);
  if (initialItems !== prevItems) {
    setPrevItems(initialItems);
    setItems(initialItems);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
  }

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  useEffect(() => {
    if (isInitialSearchSync.current) {
      isInitialSearchSync.current = false;
      return;
    }

    const currentSearch = searchParams.get('search') ?? '';
    const nextSearch = debouncedSearch.trim();
    if (currentSearch === nextSearch) return;

    const params = new URLSearchParams(searchParams.toString());
    if (nextSearch) params.set('search', nextSearch);
    else params.delete('search');
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ''}`);
  }, [debouncedSearch, searchParams, basePath, router]);

  const handlePropertyTypeChange = async (value: string) => {
    updateFilters({ property_type_id: value, property_subtype_id: '' });
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
    updateFilters({ city_id: value, neighborhood_id: '' });
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
    updateFilters({ office_id: id });
    setOfficeLabel(label);
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loading) return;

    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({ cursor });
      if (status) params.set('status', status);
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (propertyTypeId) params.set('property_type_id', propertyTypeId);
      if (propertySubtypeId) params.set('property_subtype_id', propertySubtypeId);
      if (transactionTypeId) params.set('transaction_type_id', transactionTypeId);
      if (cityId) params.set('city_id', cityId);
      if (neighborhoodId) params.set('neighborhood_id', neighborhoodId);
      if (officeId) params.set('office_id', officeId);

      const response = await fetch(`${bffPaths.listings.myListings}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const json = (await response.json()) as CursorApiResponse;

      if (!response.ok || !json.success) {
        throw new Error(json.message ?? 'Request failed');
      }

      setItems((prev) => [...prev, ...(json.data ?? [])]);
      setCursor(json.next_cursor ?? null);
      setHasMore(json.has_more ?? false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, status, debouncedSearch, propertyTypeId, propertySubtypeId, transactionTypeId, cityId, neighborhoodId, officeId]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: '240px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const runAction = async (id: string, action: () => Promise<void>, successMessageKey: TranslationKey) => {
    setActionId(id);
    try {
      await action();
      toast.success(t(successMessageKey));
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-var(--shadow-soft) sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative min-w-0 flex-1 sm:max-w-2xl">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('admin.searchListings')}
              className={cn(fieldClass, 'w-full ps-9')}
            />
          </label>

          <ButtonLink href={`${basePath}/new`} className="shrink-0 gap-1.5 self-end sm:self-auto">
            <Plus className="h-4 w-4" />
            {t('dashboard.listings.createButton')}
          </ButtonLink>
        </div>

        <div
          className={cn(
            'grid gap-2',
            enableOfficeFilter && myOffices.length > 0
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-7'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
          )}
        >
          {enableOfficeFilter && myOffices.length > 0 ? (
            <SearchableSelect
              value={officeId}
              selectedLabel={officeLabel}
              onChange={handleOfficeChange}
              fetchOptions={fetchOfficeOptions}
              placeholder={t('admin.searchOffice')}
              className="col-span-2 w-full min-w-0 sm:col-span-1"
            />
          ) : null}

          <select
            value={status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className={cn(fieldClass, 'w-full min-w-0')}
          >
            <option value="">{t('dashboard.listings.allStatuses')}</option>
            <option value="draft">{t('dashboard.listings.status.draft')}</option>
            <option value="published">{t('dashboard.listings.status.published')}</option>
            <option value="sold">{t('dashboard.listings.status.sold')}</option>
            <option value="rented">{t('dashboard.listings.status.rented')}</option>
          </select>

          <select
            value={propertyTypeId}
            onChange={(e) => void handlePropertyTypeChange(e.target.value)}
            className={cn(fieldClass, 'w-full min-w-0')}
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
            onChange={(e) => updateFilters({ property_subtype_id: e.target.value })}
            disabled={!propertyTypeId || loadingSubtypes}
            className={cn(fieldClass, 'w-full min-w-0')}
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
            onChange={(e) => updateFilters({ transaction_type_id: e.target.value })}
            className={cn(fieldClass, 'w-full min-w-0')}
          >
            <option value="">{t('dashboard.listings.transactionType')}</option>
            {transactionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.display_name_ar || type.name}
              </option>
            ))}
          </select>

          <select
            value={cityId}
            onChange={(e) => void handleCityChange(e.target.value)}
            className={cn(fieldClass, 'w-full min-w-0')}
          >
            <option value="">{t('admin.city')}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          <select
            value={neighborhoodId}
            onChange={(e) => updateFilters({ neighborhood_id: e.target.value })}
            disabled={!cityId || loadingNeighborhoods}
            className={cn(fieldClass, 'w-full min-w-0')}
          >
            <option value="">{t('dashboard.neighborhood')}</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.id}>
                {neighborhood.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <p className="text-gray-500">{t('dashboard.listings.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {items.map((listing) => (
            <MyListingCard
              key={listing.id}
              listing={listing}
              basePath={basePath}
              actionId={actionId}
              onPublish={() =>
                runAction(listing.id, () => publishListing(listing.id), 'dashboard.listings.published')
              }
              onDraft={() => runAction(listing.id, () => draftListing(listing.id), 'dashboard.listings.drafted')}
              onMarkSold={() => runAction(listing.id, () => markListingSold(listing.id), 'dashboard.listings.sold')}
              onMarkRented={() =>
                runAction(listing.id, () => markListingRented(listing.id), 'dashboard.listings.rented')
              }
              onSoftDelete={() => setConfirmDeleteId(listing.id)}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="flex min-h-8 items-center justify-center">
        {loading ? <p className="text-xs text-gray-400">…</p> : null}
        {error ? (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="text-sm font-medium text-secondary hover:underline"
          >
            {t('filters.loadMoreError')}
          </button>
        ) : null}
        {!hasMore && items.length > 0 ? (
          <p className="text-xs text-gray-400">{t('filters.endOfResults')}</p>
        ) : null}
      </div>

      <ConfirmModal
        open={confirmDeleteId !== null}
        title={t('dashboard.listings.confirmSoftDeleteTitle')}
        description={t('dashboard.listings.confirmSoftDeleteDescription')}
        confirmText={t('dashboard.listings.actionSoftDelete')}
        cancelText={t('admin.cancel')}
        danger
        loading={actionId !== null && actionId === confirmDeleteId}
        onConfirm={() =>
          confirmDeleteId
          && runAction(confirmDeleteId, () => softDeleteListing(confirmDeleteId), 'dashboard.listings.softDeleted')
        }
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
