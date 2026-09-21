import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth/session';
import { revalidateListingsMarketplace } from '@/lib/marketplace/revalidate';

export async function POST(request: NextRequest) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const listingId = request.nextUrl.searchParams.get('listingId') ?? undefined;
  revalidateListingsMarketplace(listingId);

  return NextResponse.json({ success: true, message: 'OK' });
}
