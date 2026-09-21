import { NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import {
  clearSession,
  getRefreshToken,
  setSessionCookies,
  syncAdminPermissionsCookie,
} from '@/lib/auth/session';
import { decodeJwtPayload } from '@/lib/auth/token-config';
import { ApiError } from '@/lib/errors/api-error';

interface TokenResponse {
  token: string;
  refreshToken: string;
}

export async function POST() {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetchBackend<TokenResponse>(backendPaths.auth.refreshToken, {
      method: 'POST',
      body: { refreshToken },
      cacheProfile: 'none',
    });

    const tokens = response.data;
    if (!tokens?.token || !tokens.refreshToken) {
      await clearSession();
      return NextResponse.json({ success: false, message: 'فشل تحديث الرمز' }, { status: 401 });
    }

    await setSessionCookies(tokens.token, tokens.refreshToken);

    if (decodeJwtPayload(tokens.token)?.role === 'sub_admin') {
      await syncAdminPermissionsCookie(tokens.token);
    }

    return NextResponse.json({
      success: true,
      message: response.message,
    });
  } catch (err) {
    await clearSession();
    if (err instanceof ApiError) {
      return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    }
    return NextResponse.json({ success: false, message: 'فشل تحديث الرمز' }, { status: 500 });
  }
}
