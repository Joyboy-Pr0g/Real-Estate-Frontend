'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { AdminListingsPage, AdminListingSummary } from '@/features/listings/types/listing';

export async function loadMoreAdminListings(params: Record<string, string>): Promise<AdminListingsPage> {
  const response = await clientFetch<AdminListingSummary[]>(bffPaths.admin.listings, { searchParams: params });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}
