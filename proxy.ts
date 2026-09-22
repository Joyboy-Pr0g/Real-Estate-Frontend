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

/** Production site origin from env (must match sitemap + rel=canonical). */
function resolveCanonicalSiteUrl(): URL | null {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim();

  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      return new URL('https://yemen-land.com');
    }
    return null;
  }

  try {
    return new URL(raw.endsWith('/') ? raw.slice(0, -1) : raw);
  } catch {
    return null;
  }
}

/**
 * One host + HTTPS for SEO: www/http variants → canonical origin (301).
 * Fixes GSC "alternate page with proper canonical" when Google crawls www but canonical is apex.
 */
function redirectToCanonicalSite(request: NextRequest): NextResponse | null {
  const canonical = resolveCanonicalSiteUrl();
  if (!canonical) return null;

  const requestHost = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  if (!requestHost || requestHost === 'localhost' || requestHost === '127.0.0.1') {
    return null;
  }

  const canonicalHost = canonical.hostname.toLowerCase();
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  const requestIsHttps =
    forwardedProto === 'https' || request.nextUrl.protocol === 'https:';
  const wantHttps = canonical.protocol === 'https:';

  const hostMismatch = requestHost !== canonicalHost;
  const protoMismatch = wantHttps && !requestIsHttps;

  if (!hostMismatch && !protoMismatch) return null;

  const destination = request.nextUrl.clone();
  destination.protocol = canonical.protocol;
  destination.hostname = canonicalHost;
  destination.port = '';

  return NextResponse.redirect(destination, 301);
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
  const canonicalRedirect = redirectToCanonicalSite(request);
  if (canonicalRedirect) {
    return canonicalRedirect;
  }

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
