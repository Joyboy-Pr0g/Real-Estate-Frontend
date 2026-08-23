'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toast } from '@/components/ui/toaster';
import { MyListingsActionsMenu } from '@/features/listings/components/dashboard/MyListingsActionsMenu';
import { PublicListing } from '@/features/listings/types/listing';
import { PublicCity, PublicPropertyType, PublicTransactionType } from '@/features/catalog/types/catalog';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
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
import type { TranslationKey } from '@/lib/i18n/ar';

interface MyListingsPanelProps {
  initialItems: PublicListing[];
  initialCursor: string | null;
  initialHasMore: boolean;
  basePath?: string;
  propertyTypes: PublicPropertyType[];
  transactionTypes: PublicTransactionType[];
  cities: PublicCity[];
  initialSubtypes: PublicPropertySubtype[];
  initialNeighborhoods: PublicNeighborhood[];
}

interface CursorApiResponse {
  success: boolean;
  data: PublicListing[];
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
}: MyListingsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loading) return;

    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({ cursor });
      if (status) params.set('status', status);
      if (propertyTypeId) params.set('property_type_id', propertyTypeId);
      if (propertySubtypeId) params.set('property_subtype_id', propertySubtypeId);
      if (transactionTypeId) params.set('transaction_type_id', transactionTypeId);
      if (cityId) params.set('city_id', cityId);
      if (neighborhoodId) params.set('neighborhood_id', neighborhoodId);

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
  }, [cursor, hasMore, loading, status, propertyTypeId, propertySubtypeId, transactionTypeId, cityId, neighborhoodId]);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className={fieldClass}
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
            onChange={(e) => updateFilters({ property_subtype_id: e.target.value })}
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
            onChange={(e) => updateFilters({ transaction_type_id: e.target.value })}
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
            onChange={(e) => updateFilters({ neighborhood_id: e.target.value })}
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

        <ButtonLink href={`${basePath}/new`} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t('dashboard.listings.createButton')}
        </ButtonLink>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <p className="text-gray-500">{t('dashboard.listings.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {listing.main_photo ? (
                  <Image src={listing.main_photo} alt={listing.title} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <Building2 className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-primary-dark">{listing.title}</p>
                <p className="text-xs text-gray-500">
                  {listing.neighborhood_name}, {listing.city_name}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-brand-dark">{formatPriceYER(listing.price)}</p>
              </div>

              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                  STATUS_STYLES[listing.status],
                )}
              >
                {t(`dashboard.listings.status.${listing.status}` as TranslationKey)}
              </span>

              <MyListingsActionsMenu
                listing={listing}
                editHref={`${basePath}/${listing.id}/edit`}
                disabled={actionId === listing.id}
                onPublish={() =>
                  runAction(listing.id, () => publishListing(listing.id), 'dashboard.listings.published')
                }
                onDraft={() => runAction(listing.id, () => draftListing(listing.id), 'dashboard.listings.drafted')}
                onMarkSold={() =>
                  runAction(listing.id, () => markListingSold(listing.id), 'dashboard.listings.sold')
                }
                onMarkRented={() =>
                  runAction(listing.id, () => markListingRented(listing.id), 'dashboard.listings.rented')
                }
                onSoftDelete={() => setConfirmDeleteId(listing.id)}
              />
            </div>
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
