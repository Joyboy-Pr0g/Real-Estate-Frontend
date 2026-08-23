import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { AuthUser } from '@/features/auth/types/user';
import { ApiError } from '@/lib/errors/api-error';
import { proxyToBackend } from '@/lib/api/route-handler';
import { updateProfileBodySchema } from '@/features/auth/schemas/auth-schemas';

export async function GET() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetchBackend<AuthUser>(backendPaths.auth.me, {
      token,
      cacheProfile: 'none',
    });

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      const response = NextResponse.json(
        { success: false, message: err.message },
        { status: err.status },
      );
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    if (err instanceof ApiError) {
      return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    }

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateProfileBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? 'Validation failed' },
        { status: 400 },
      );
    }

    return proxyToBackend(
      new NextRequest(request.url, {
        method: 'PATCH',
        headers: request.headers,
        body: JSON.stringify(parsed.data),
      }),
      { path: backendPaths.auth.me, method: 'PATCH' },
    );
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}
