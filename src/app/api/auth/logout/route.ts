import { NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { clearSession, getRawAuthToken, getRefreshToken } from '@/lib/auth/session';
import { ApiError } from '@/lib/errors/api-error';
import { getRequestClientIp } from '@/lib/security/client-ip';

export async function POST() {
  try {
    const token = await getRawAuthToken();
    const refreshToken = await getRefreshToken();

    if (token) {
      try {
        await fetchBackend(backendPaths.auth.logout, {
          method: 'POST',
          token,
          body: refreshToken ? { refreshToken } : undefined,
          cacheProfile: 'none',
          clientIp: await getRequestClientIp(),
        });
      } catch {
        // Still clear cookies if backend logout fails
      }
    }

    await clearSession();
    return NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  } catch (err) {
    await clearSession();
    if (err instanceof ApiError) {
      return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    }
    return NextResponse.json({ success: true, message: 'تم تسجيل الخروج' });
  }
}
