import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/errors/api-error';

interface RouteContext {
  params: Promise<{ propertyTypeId: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { propertyTypeId } = await context.params;

    const res = await serverFetch<unknown[]>(
      backendPaths.propertySubtypes.byPropertyType(propertyTypeId),
      { cacheProfile: 'long' },
    );

    return NextResponse.json({
      success: true,
      message: 'تم جلب الأنواع الفرعية للعقار بنجاح',
      data: res.data ?? [],
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
