import { NextRequest, NextResponse } from 'next/server';
import { fetchBackend } from '@/lib/api/fetch';
import { getAuthToken } from '@/lib/auth/session';
import { ApiError } from '@/lib/errors/api-error';

interface ProxyOptions {
  path: string;
  method?: string;
  requireAuth?: boolean;
  searchParams?: Record<string, string>;
}

export async function proxyToBackend(
  request: NextRequest,
  { path, method, requireAuth = true, searchParams }: ProxyOptions,
): Promise<NextResponse> {
  try {
    const token = await getAuthToken({ refresh: true });
    if (requireAuth && !token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') ?? '';
    let body: BodyInit | Record<string, unknown> | undefined;

    const resolvedMethod = method ?? request.method;
    if (resolvedMethod !== 'GET') {
      if (contentType.includes('multipart/form-data')) {
        body = await request.formData();
      } else {
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = undefined;
        }
      }
    }

    const queryParams = searchParams ?? Object.fromEntries(request.nextUrl.searchParams);

    const response = await fetchBackend(path, {
      method: resolvedMethod,
      token,
      body,
      searchParams: queryParams,
      cacheProfile: 'none',
    });

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: err.message, error: { message: err.message, details: err.details } },
        { status: err.status },
      );
    }
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
