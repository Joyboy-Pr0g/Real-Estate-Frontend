import { NextRequest, NextResponse } from 'next/server';
import { listingSearchQuerySchema } from '@/features/listings/schemas/search-schema';
import { parseSpecFromSearchParams } from '@/features/listings/lib/spec-url';
import { listingService } from '@/features/listings/services/listing-service';
import { resolveListingSearchParams } from '@/features/listings/services/resolve-listing-search';
import { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';
import { ApiError } from '@/lib/errors/api-error';
import { ZodError } from 'zod';

const SEARCH_CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=30',
};

function usesResolvedIdParams(raw: Record<string, string>): boolean {
  return Boolean(
    raw.city_id || raw.neighborhood_id || raw.property_type_id || raw.property_subtype_id || raw.transaction_type_id,
  );
}

export async function GET(req: NextRequest) {
  try {
    const raw = Object.fromEntries(req.nextUrl.searchParams.entries());

    const spec = parseSpecFromSearchParams(req.nextUrl.searchParams);
    const filters = usesResolvedIdParams(raw)
      ? listingSearchQuerySchema.parse({
          ...raw,
          ...(Object.keys(spec).length > 0 ? { spec } : {}),
        })
      : await resolveListingSearchParams(raw as ListingSearchUrlParams);

    const result = await listingService.search(filters);

    return NextResponse.json(
      {
        success: true,
        message: 'تم جلب العقارات بنجاح',
        data: result.items,
        next_cursor: result.next_cursor,
        has_more: result.has_more,
      },
      { headers: SEARCH_CACHE_HEADERS },
    );
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
