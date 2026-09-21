import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth/session';

/** Access JWT for browser → API multipart uploads (avoids Vercel ~4.5MB BFF body limit). */
export async function GET() {
  const token = await getAuthToken({ refresh: true });
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: { token } });
}
