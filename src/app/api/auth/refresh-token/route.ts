import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { refreshTokenBodySchema } from '@/features/auth/schemas/auth-schemas';
import { setAuthCookie } from '@/lib/auth/session';
import { ApiError } from '@/lib/errors/api-error';

interface TokenResponse {
  token: string;
  refreshToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = refreshTokenBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'فشل تحديث الرمز' },
        { status: 400 },
      );
    }

    const response = await fetchBackend<TokenResponse>(backendPaths.auth.refreshToken, {
      method: 'POST',
      body: parsed.data,
      cacheProfile: 'none',
    });

    await setAuthCookie(response.data!.token);

    return NextResponse.json({
      success: true,
      message: response.message,
      data: { refreshToken: response.data!.refreshToken },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    }
    return NextResponse.json({ success: false, message: 'فشل تحديث الرمز' }, { status: 500 });
  }
}
