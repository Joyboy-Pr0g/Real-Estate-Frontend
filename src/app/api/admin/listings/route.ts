import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { adminListingsSearchSchema } from '@/features/admin/schemas/moderation-schemas';

export async function GET(request: NextRequest) {
  const parsed = adminListingsSearchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    );
  }

  const params: Record<string, string> = {};
  if (parsed.data.status) params.status = parsed.data.status;
  if (parsed.data.search) params.search = parsed.data.search;
  if (parsed.data.property_type_id) params.property_type_id = parsed.data.property_type_id;
  if (parsed.data.property_subtype_id) params.property_subtype_id = parsed.data.property_subtype_id;
  if (parsed.data.transaction_type_id) params.transaction_type_id = parsed.data.transaction_type_id;
  if (parsed.data.city_id) params.city_id = parsed.data.city_id;
  if (parsed.data.neighborhood_id) params.neighborhood_id = parsed.data.neighborhood_id;
  if (parsed.data.office_id) params.office_id = parsed.data.office_id;
  if (parsed.data.individual_lister_id) params.individual_lister_id = parsed.data.individual_lister_id;
  if (parsed.data.cursor) params.cursor = parsed.data.cursor;
  if (parsed.data.limit) params.limit = String(parsed.data.limit);
  if (parsed.data.include_deleted) params.include_deleted = 'true';

  return proxyToBackend(request, {
    path: backendPaths.listings.adminList,
    method: 'GET',
    searchParams: params,
  });
}
