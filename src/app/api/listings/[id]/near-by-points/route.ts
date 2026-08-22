import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { nearByPointsQuerySchema } from '@/features/listings/schemas/near-by-points-schema';
import { listingService } from '@/features/listings/services/listing-service';
import { ApiError } from '@/lib/errors/api-error';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = nearByPointsQuerySchema.parse(raw);
    const data = await listingService.getNearByPoints(id, query);

    return NextResponse.json({
      success: true,
      message: 'تم جلب النقاط القريبة بنجاح',
      data,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message ?? 'Validation error' },
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
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
