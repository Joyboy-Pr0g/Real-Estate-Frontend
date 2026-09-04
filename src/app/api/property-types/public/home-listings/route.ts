import { NextResponse } from 'next/server';
import { HOME_LISTINGS_PER_TYPE } from '@/features/home/constants/home-listings';
import { homeListingsService } from '@/features/home/services/home-listings-service';
import { ApiError } from '@/lib/errors/api-error';

export async function GET() {
  try {
    const data = await homeListingsService.getByPropertyType(HOME_LISTINGS_PER_TYPE);
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
