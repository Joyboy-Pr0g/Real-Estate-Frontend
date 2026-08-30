'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { MyListingSummary } from '@/features/listings/types/listing';

export async function createListing(formData: FormData): Promise<{ id: string }> {
  const res = await clientFetch<{ id: string }>(bffPaths.listings.create, {
    method: 'POST',
    body: formData,
  });
  return res.data!;
}

export async function updateListing(id: string, formData: FormData): Promise<void> {
  await clientFetch(bffPaths.listings.byId(id), { method: 'PUT', body: formData });
}

export async function publishListing(id: string): Promise<void> {
  await clientFetch(bffPaths.listings.publish(id), { method: 'PATCH' });
}

export async function draftListing(id: string): Promise<void> {
  await clientFetch(bffPaths.listings.draft(id), { method: 'PATCH' });
}

export async function markListingSold(id: string): Promise<void> {
  await clientFetch(bffPaths.listings.sold(id), { method: 'PATCH' });
}

export async function markListingRented(id: string): Promise<void> {
  await clientFetch(bffPaths.listings.rented(id), { method: 'PATCH' });
}

export async function softDeleteListing(id: string): Promise<void> {
  await clientFetch(bffPaths.listings.softDelete(id), { method: 'PATCH' });
}

export async function restoreListing(id: string): Promise<void> {
  await clientFetch(bffPaths.listings.restore(id), { method: 'PATCH' });
}

export async function hardDeleteListing(id: string): Promise<void> {
  await clientFetch(bffPaths.listings.delete(id), { method: 'DELETE' });
}

export interface MyDeletedListingsPage {
  items: MyListingSummary[];
  next_cursor: string | null;
  has_more: boolean;
}

export async function fetchMyDeletedListings(params: Record<string, string> = {}): Promise<MyDeletedListingsPage> {
  const response = await clientFetch<MyListingSummary[]>(bffPaths.listings.myListings, {
    searchParams: { ...params, deleted_only: 'true' },
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}

export async function bulkDeleteListings(ids: string[]): Promise<number> {
  const res = await clientFetch<{ deleted: number }>(bffPaths.admin.listingsBulk, {
    method: 'DELETE',
    body: { ids },
  });
  return res.data?.deleted ?? 0;
}

export async function deleteListingImage(id: string, publicId: string): Promise<void> {
  await clientFetch(bffPaths.listings.deleteImage(id), { method: 'DELETE', body: { public_id: publicId } });
}

export async function setListingMainImage(id: string, publicId: string): Promise<void> {
  await clientFetch(bffPaths.listings.setMainImage(id), { method: 'PATCH', body: { public_id: publicId } });
}

export async function deleteListingVideo(id: string, publicId: string): Promise<void> {
  await clientFetch(bffPaths.listings.deleteVideo(id), { method: 'DELETE', body: { public_id: publicId } });
}

export async function unsaveListing(id: string): Promise<void> {
  await clientFetch(bffPaths.listings.save(id), { method: 'DELETE' });
}

export async function removeViewHistoryEntry(listingId: string): Promise<void> {
  await clientFetch(bffPaths.listings.myViewHistoryEntry(listingId), { method: 'DELETE' });
}

export async function checkSavedListingIds(listingIds: string[]): Promise<string[]> {
  if (listingIds.length === 0) return [];
  const res = await clientFetch<string[]>(bffPaths.listings.checkSaved, {
    method: 'POST',
    body: { listing_ids: listingIds },
  });
  return res.data ?? [];
}
