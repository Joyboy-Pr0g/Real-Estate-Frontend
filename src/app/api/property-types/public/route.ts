import { NextResponse } from 'next/server';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { ApiError } from '@/lib/errors/api-error';

export async function GET() {
  try {
    const data = await catalogService.getPropertyTypes();
    return NextResponse.json({ success: true, message: 'OK', data });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
