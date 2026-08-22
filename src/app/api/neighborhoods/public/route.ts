import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/errors/api-error';
import { normalizePublicNeighborhoods } from '@/features/catalog/lib/normalize-neighborhood';

export async function GET(req: NextRequest) {
  try {
    const cityId = req.nextUrl.searchParams.get('city_id');
    const searchParams: Record<string, string | number> = { limit: 100 };
    if (cityId) searchParams.city_id = cityId;

    const res = await serverFetch<unknown[]>(backendPaths.neighborhoods.public, {
      cacheProfile: 'short',
      searchParams,
    });

    const data = normalizePublicNeighborhoods(
      (res.data ?? []) as Array<Record<string, unknown>>,
    );

    return NextResponse.json({
      success: true,
      message: 'تم جلب الأحياء بنجاح',
      data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
