import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth/session';
import { revalidateListingsMarketplace } from '@/lib/marketplace/revalidate';
import { resolveListingRevalidationAccess } from '@/lib/marketplace/listing-revalidation';
import { getClientIp } from '@/lib/security/client-ip';

export async function POST(request: NextRequest) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ success: false, message: 'غير مصرح ' }, { status: 401 });
  }

  const listingId = request.nextUrl.searchParams.get('listingId') || undefined;

  try {
    const access = await resolveListingRevalidationAccess(token, listingId, getClientIp(request));

    if (access.status === 'unauthorized') {
      return NextResponse.json({ success: false, message: 'غير مصرح ' }, { status: 401 });
    }

    if (access.status === 'forbidden') {
      return NextResponse.json({ success: false, message: 'غير مصرح لك بتنفيذ هذه العملية' }, { status: 403 });
    }

    revalidateListingsMarketplace({ listingId, slugs: [access.slug] });
    return NextResponse.json({ success: true, message: 'OK' });
  } catch {
    return NextResponse.json({ success: false, message: 'الخدمة غير متاحة' }, { status: 503 });
  }
}
