import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/route-handler';
import { backendPaths } from '@/lib/api/endpoints';
import { adminOfficesSearchSchema } from '@/features/admin/schemas/moderation-schemas';

export async function GET(request: NextRequest) {
  const parsed = adminOfficesSearchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    );
  }

  const params: Record<string, string> = {};
  if (parsed.data.verificationStatus) params.verificationStatus = parsed.data.verificationStatus;
  if (parsed.data.search) params.search = parsed.data.search;
  if (parsed.data.cursor) params.cursor = parsed.data.cursor;
  if (parsed.data.limit) params.limit = String(parsed.data.limit);
  if (parsed.data.include_deleted) params.include_deleted = 'true';

  return proxyToBackend(request, {
    path: backendPaths.offices.list,
    method: 'GET',
    searchParams: params,
  });
}
