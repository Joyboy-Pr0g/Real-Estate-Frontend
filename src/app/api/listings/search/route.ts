import { NextRequest, NextResponse } from 'next/server';
import { listingSearchQuerySchema } from '@/features/listings/schemas/search-schema';
import { parseSpecFromSearchParams } from '@/features/listings/lib/spec-url';
import { listingService } from '@/features/listings/services/listing-service';
import { ApiError } from '@/lib/errors/api-error';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
    const spec = parseSpecFromSearchParams(req.nextUrl.searchParams);
    const params = listingSearchQuerySchema.parse({
      ...raw,
      ...(Object.keys(spec).length > 0 ? { spec } : {}),
    });
    const result = await listingService.search(params);

    return NextResponse.json({
      success: true,
      message: 'تم جلب العقارات بنجاح',
      data: result.items,
      next_cursor: result.next_cursor,
      has_more: result.has_more,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message ?? 'فشل البحث' },
        { status: 400 },
      );
    }

    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { success: false, message: 'خطأ في الخادم' },
      { status: 500 },
    );
  }
}
