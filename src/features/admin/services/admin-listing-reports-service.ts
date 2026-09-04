import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { MyListingReport } from '@/features/listings/types/listing';

interface CursorParams {
  cursor?: string;
  limit?: number;
}

function buildCursorParams(params: CursorParams): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (params.cursor) out.cursor = params.cursor;
  if (params.limit) out.limit = params.limit;
  return out;
}

export async function getAdminListingReports(
  params: CursorParams & { status?: string } = {},
): Promise<{ items: MyListingReport[]; next_cursor: string | null; has_more: boolean }> {
  const token = await getAuthToken();
  if (!token) return { items: [], next_cursor: null, has_more: false };

  try {
    const response = await serverFetch<MyListingReport[]>(backendPaths.listings.reports, {
      token,
      cacheProfile: 'none',
      searchParams: {
        ...buildCursorParams(params),
        ...(params.status ? { status: params.status } : {}),
      },
    });

    return {
      items: response.data ?? [],
      next_cursor: response.next_cursor ?? null,
      has_more: response.has_more ?? false,
    };
  } catch {
    return { items: [], next_cursor: null, has_more: false };
  }
}
