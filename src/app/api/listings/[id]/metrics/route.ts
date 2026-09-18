import { NextRequest, NextResponse } from 'next/server';
import { listingService } from '@/features/listings/services/listing-service';
import { ApiError } from '@/lib/errors/api-error';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await listingService.getMetrics(id);

    return NextResponse.json({
      success: true,
      message: 'تم جلب مقاييس العقار بنجاح',
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
