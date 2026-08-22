import { NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { clearAuthCookie, getAuthToken } from '@/lib/auth/session';
import { ApiError } from '@/lib/errors/api-error';

export async function POST() {
  try {
    const token = await getAuthToken();
    if (token) {
      try {
        await fetchBackend(backendPaths.auth.logout, { method: 'POST', token, cacheProfile: 'none' });
      } catch {
        // Still clear cookie if backend logout fails
      }
    }
    await clearAuthCookie();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    await clearAuthCookie();
    if (err instanceof ApiError) {
      return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    }
    return NextResponse.json({ success: true, message: 'Logged out' });
  }
}
