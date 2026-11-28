import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
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
  decodeJwtPayload,
  isAccessTokenExpired,
} from '@/lib/auth/token-config';
import { getClientIp } from '@/lib/security/client-ip';

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

const PRIVATE_CACHE_CONTROL = 'private, no-store';
const LOCALE_PREFIX_PATTERN = /^\/(ar|en)(?=\/|$)/;

interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

type RefreshResult =
  | { status: 'skipped' }
  | { status: 'refreshed'; tokens: RefreshedTokens }
  | { status: 'rejected' };

const SKIPPED_REFRESH: RefreshResult = { status: 'skipped' };
const REJECTED_REFRESH: RefreshResult = { status: 'rejected' };

function isRejectedRefreshStatus(status: number): boolean {
  return status >= 400 && status < 500 && status !== 429;
}

function resolveBackendUrl(): string {
  const raw = env.BACKEND_URL ?? 'https://api.yemen-land.com/api';
  return raw.replace(/\/$/, '');
}

async function refreshTokensIfNeeded(request: NextRequest): Promise<RefreshResult> {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const accessTokenReadable = accessToken ? decodeJwtPayload(accessToken) !== null : false;
  if (accessToken && accessTokenReadable && !isAccessTokenExpired(accessToken)) {
    return SKIPPED_REFRESH;
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return accessToken && !accessTokenReadable ? REJECTED_REFRESH : SKIPPED_REFRESH;
  }

  const clientIp = getClientIp(request);

  try {
    const response = await fetch(`${resolveBackendUrl()}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(clientIp ? { 'X-Forwarded-For': clientIp } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return isRejectedRefreshStatus(response.status) ? REJECTED_REFRESH : SKIPPED_REFRESH;
    }

    const json = (await response.json()) as {
      data?: { token?: string; refreshToken?: string };
    };

    if (!json.data?.token || !json.data.refreshToken) {
      return REJECTED_REFRESH;
    }

    return {
      status: 'refreshed',
      tokens: {
        accessToken: json.data.token,
        refreshToken: json.data.refreshToken,
      },
    };
  } catch {
    return SKIPPED_REFRESH;
  }
}

function markPrivate(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', PRIVATE_CACHE_CONTROL);
  return response;
}

function clearSessionCookies(response: NextResponse): NextResponse {
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  response.cookies.delete(ADMIN_PERMISSIONS_COOKIE);
  return markPrivate(response);
}

function applyRefreshResult(response: NextResponse, refresh: RefreshResult): NextResponse {
  if (refresh.status === 'rejected') {
    return clearSessionCookies(response);
  }

  if (refresh.status === 'refreshed') {
    response.cookies.set(AUTH_COOKIE_NAME, refresh.tokens.accessToken, authCookieOptions);
    response.cookies.set(REFRESH_COOKIE_NAME, refresh.tokens.refreshToken, refreshCookieOptions);
    return markPrivate(response);
  }

  return response;
}

function nextResponse(request: NextRequest, refresh: RefreshResult): NextResponse {
  if (refresh.status === 'refreshed') {
    request.cookies.set(AUTH_COOKIE_NAME, refresh.tokens.accessToken);
    request.cookies.set(REFRESH_COOKIE_NAME, refresh.tokens.refreshToken);
  }

  if (refresh.status === 'rejected') {
    request.cookies.delete([AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, ADMIN_PERMISSIONS_COOKIE]);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(REFRESHED_ACCESS_TOKEN_HEADER);

  return applyRefreshResult(
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
    refresh,
  );
}

function redirectToUnprefixedPath(request: NextRequest): NextResponse | null {
  const match = LOCALE_PREFIX_PATTERN.exec(request.nextUrl.pathname);
  if (!match) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = request.nextUrl.pathname.slice(match[0].length) || '/';
  return NextResponse.redirect(url, 308);
}

function redirectResponse(
  url: URL,
  refresh: RefreshResult,
  options?: { clearSession?: boolean },
): NextResponse {
  let response = NextResponse.redirect(url);

  if (options?.clearSession) {
    response = clearSessionCookies(response);
  }

  return applyRefreshResult(response, refresh);
}

export async function proxy(request: NextRequest) {
  const unprefixedRedirect = redirectToUnprefixedPath(request);
  if (unprefixedRedirect) {
    return unprefixedRedirect;
  }

  const refresh = await refreshTokensIfNeeded(request);
  const refreshed = refresh.status === 'refreshed' ? refresh.tokens : null;
  const sessionRejected = refresh.status === 'rejected';
  const { pathname } = request.nextUrl;
  const accessToken = sessionRejected
    ? undefined
    : refreshed?.accessToken ?? request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = sessionRejected
    ? undefined
    : refreshed?.refreshToken ?? request.cookies.get(REFRESH_COOKIE_NAME)?.value;
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
        return redirectResponse(new URL('/admin', request.url), refresh);
      }
      if ((pathname === '/register' || pathname === '/login') && !isAdminPanelRole(role)) {
        return redirectResponse(new URL('/', request.url), refresh);
      }
    } else if (!hasRefreshSession) {
      return clearSessionCookies(nextResponse(request, refresh));
    }
  }

  if (isAuthRoute) {
    return nextResponse(request, refresh);
  }

  if (!isAdminRoute && !isDashboardRoute) {
    return nextResponse(request, refresh);
  }

  if (!accessToken && !hasRefreshSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return redirectResponse(url, refresh);
  }

  if (!role && !hasRefreshSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return redirectResponse(url, refresh, { clearSession: true });
  }

  if (!role && hasRefreshSession) {
    return nextResponse(request, refresh);
  }

  if (!role) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return redirectResponse(url, refresh, { clearSession: true });
  }

  if (isAdminRoute && !isAdminPanelRole(role)) {
    return redirectResponse(new URL('/', request.url), refresh);
  }

  if (isAdminRoute && isSubAdminRole(role)) {
    if (pathname.startsWith('/admin/permissions')) {
      const url = new URL('/admin', request.url);
      url.searchParams.set('access_denied', '1');
      return redirectResponse(url, refresh);
    }

    const permissions = decodePermissionsCookie(
      request.cookies.get(ADMIN_PERMISSIONS_COOKIE)?.value,
    );

    if (!permissions || permissions.length === 0) {
      if (pathname === '/admin') {
        return nextResponse(request, refresh);
      }
      const url = new URL('/admin', request.url);
      url.searchParams.set('access_denied', '1');
      return redirectResponse(url, refresh);
    }

    if (!canAccessAdminPath(pathname, permissions)) {
      const url = new URL('/admin', request.url);
      url.searchParams.set('access_denied', '1');
      return redirectResponse(url, refresh);
    }
  }

  if (isDashboardRoute && isAdminPanelRole(role)) {
    return redirectResponse(new URL('/admin', request.url), refresh);
  }

  return nextResponse(request, refresh);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|favicon/|.*\\.(?:ico|png|jpe?g|gif|svg|webp|avif|txt|xml|js|json|webmanifest|map|css|woff2?|ttf|otf|mp4|webm|pdf)$).*)',
  ],
};
