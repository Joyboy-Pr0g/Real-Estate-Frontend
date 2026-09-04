'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { MyListingReport, MyListingReportStatus } from '@/features/listings/types/listing';

export async function updateListingReport(
  reportId: string,
  body: { status: MyListingReportStatus; admin_notes?: string },
): Promise<MyListingReport> {
  const res = await clientFetch<MyListingReport>(bffPaths.listings.reportById(reportId), {
    method: 'PATCH',
    body,
  });
  return res.data!;
}

export async function fetchAdminListingReports(params: Record<string, string> = {}) {
  const res = await clientFetch<MyListingReport[]>(bffPaths.listings.reports, {
    searchParams: params,
  });
  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: Boolean(res.has_more),
  };
}
