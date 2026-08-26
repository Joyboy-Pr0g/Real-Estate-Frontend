import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import {
  CursorPage,
  ListingActionLogsBundle,
  OfficeActionLogEntry,
} from '@/features/admin/types/action-logs';

export async function getListingOfficeActionLogs(
  listingId: string,
  params: { cursor?: string; limit?: number } = {},
): Promise<CursorPage<OfficeActionLogEntry>> {
  const res = await clientFetch<OfficeActionLogEntry[]>(bffPaths.listings.officeActionLogs(listingId), {
    searchParams: params,
  });

  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: Boolean(res.has_more),
  };
}

export async function getAdminListingActionLogs(
  listingId: string,
  params: { admin_cursor?: string; office_cursor?: string; limit?: number } = {},
): Promise<ListingActionLogsBundle> {
  const res = await clientFetch<ListingActionLogsBundle>(bffPaths.admin.listingActionLogs(listingId), {
    searchParams: params,
  });
  return (
    res.data ?? {
      admin_logs: { items: [], next_cursor: null, has_more: false },
      office_logs: { items: [], next_cursor: null, has_more: false },
    }
  );
}
