import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  REFRESHED_ACCESS_TOKEN_HEADER,
  decodeTokenRole,
  isAdminPanelRole,
  isSubAdminRole,
} from '@/lib/auth/constants';
import {
  ADMIN_PERMISSIONS_COOKIE,
  canAccessAdminPath,
  decodePermissionsCookie,
} from '@/lib/auth/admin-route-permissions';
import {
  ACCESS_TOKEN_MAX_AGE_SEC,
  REFRESH_TOKEN_MAX_AGE_SEC,
  isAccessTokenExpired,
} from '@/lib/auth/token-config';

const secureCookies = process.env.NODE_ENV === 'production';

const authCookieOptions = {
  httpOnly: true,
  secure: secureCookies,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ACCESS_TOKEN_MAX_AGE_SEC,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: secureCookies,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
};

interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

function resolveBackendUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3000/api';
  return raw.replace(/\/$/, '');
}

async function refreshTokensIfNeeded(request: NextRequest): Promise<RefreshedTokens | null> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return null;
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return null;
  }

  try {
    const response = await fetch(`${resolveBackendUrl()}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as {
      data?: { token?: string; refreshToken?: string };
    };

    if (!json.data?.token || !json.data.refreshToken) {
      return null;
    }

    return {
      accessToken: json.data.token,
      refreshToken: json.data.refreshToken,
    };
  } catch {
    return null;
  }
}

function applyRefreshedTokens(response: NextResponse, refreshed: RefreshedTokens | null): NextResponse {
  if (!refreshed) {
    return response;
  }

  response.cookies.set(AUTH_COOKIE_NAME, refreshed.accessToken, authCookieOptions);
  response.cookies.set(REFRESH_COOKIE_NAME, refreshed.refreshToken, refreshCookieOptions);
  return response;
}

function clearSessionCookies(response: NextResponse): NextResponse {
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  response.cookies.delete(ADMIN_PERMISSIONS_COOKIE);
  return response;
}

function nextResponse(request: NextRequest, refreshed: RefreshedTokens | null): NextResponse {
  const requestHeaders = new Headers(request.headers);
  if (refreshed) {
    requestHeaders.set(REFRESHED_ACCESS_TOKEN_HEADER, refreshed.accessToken);
  }

  return applyRefreshedTokens(
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
    refreshed,
  );
}

function redirectResponse(
  url: URL,
  refreshed: RefreshedTokens | null,
  options?: { clearSession?: boolean },
): NextResponse {
  let response = NextResponse.redirect(url);

  if (options?.clearSession) {
    response = clearSessionCookies(response);
  }

  return applyRefreshedTokens(response, refreshed);
}

export async function proxy(request: NextRequest) {
  const refreshed = await refreshTokensIfNeeded(request);
  const { pathname } = request.nextUrl;
  const accessToken =
    refreshed?.accessToken ?? request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken =
    refreshed?.refreshToken ?? request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const role = accessToken ? decodeTokenRole(accessToken) : null;
  const hasRefreshSession = Boolean(refreshToken);

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/verify-email';

  if (isAuthRoute && (accessToken || hasRefreshSession)) {
    if (role) {
      if (isAdminPanelRole(role) && pathname !== '/verify-email') {
        return redirectResponse(new URL('/admin', request.url), refreshed);
      }
      if ((pathname === '/register' || pathname === '/login') && !isAdminPanelRole(role)) {
        return redirectResponse(new URL('/', request.url), refreshed);
      }
    } else if (!hasRefreshSession) {
      return clearSessionCookies(nextResponse(request, refreshed));
    }
  }

  if (isAuthRoute) {
    return nextResponse(request, refreshed);
  }

  if (!isAdminRoute && !isDashboardRoute) {
    return nextResponse(request, refreshed);
  }

  if (!accessToken && !hasRefreshSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return redirectResponse(url, refreshed);
  }

  if (!role && !hasRefreshSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return redirectResponse(url, refreshed, { clearSession: true });
  }

  if (!role && hasRefreshSession) {
    return nextResponse(request, refreshed);
  }

  if (!role) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return redirectResponse(url, refreshed, { clearSession: true });
  }

  if (isAdminRoute && !isAdminPanelRole(role)) {
    return redirectResponse(new URL('/', request.url), refreshed);
  }

  if (isAdminRoute && isSubAdminRole(role)) {
    if (pathname.startsWith('/admin/permissions')) {
      const url = new URL('/admin', request.url);
      url.searchParams.set('access_denied', '1');
      return redirectResponse(url, refreshed);
    }

    const permissions = decodePermissionsCookie(
      request.cookies.get(ADMIN_PERMISSIONS_COOKIE)?.value,
    );

    if (!permissions || permissions.length === 0) {
      if (pathname === '/admin') {
        return nextResponse(request, refreshed);
      }
      const url = new URL('/admin', request.url);
      url.searchParams.set('access_denied', '1');
      return redirectResponse(url, refreshed);
    }

    if (!canAccessAdminPath(pathname, permissions)) {
      const url = new URL('/admin', request.url);
      url.searchParams.set('access_denied', '1');
      return redirectResponse(url, refreshed);
    }
  }

  if (isDashboardRoute && isAdminPanelRole(role)) {
    return redirectResponse(new URL('/admin', request.url), refreshed);
  }

  return nextResponse(request, refreshed);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon/|apple-touch-icon.png|site.webmanifest|api/).*)'],
};
