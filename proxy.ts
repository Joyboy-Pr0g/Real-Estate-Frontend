import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  decodeTokenRole,
  isAdminPanelRole,
  isSubAdminRole,
} from '@/lib/auth/constants';
import {
  ADMIN_PERMISSIONS_COOKIE,
  canAccessAdminPath,
  decodePermissionsCookie,
} from '@/lib/auth/admin-route-permissions';

function clearSessionCookies(response: NextResponse): NextResponse {
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  response.cookies.delete(ADMIN_PERMISSIONS_COOKIE);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
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
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      if ((pathname === '/register' || pathname === '/login') && !isAdminPanelRole(role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else if (!hasRefreshSession) {
      return clearSessionCookies(NextResponse.next());
    }
  }

  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (!isAdminRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  if (!accessToken && !hasRefreshSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (!role && !hasRefreshSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return clearSessionCookies(NextResponse.redirect(url));
  }

  if (!role && hasRefreshSession) {
    return NextResponse.next();
  }

  if (!role) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return clearSessionCookies(NextResponse.redirect(url));
  }

  if (isAdminRoute && !isAdminPanelRole(role)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAdminRoute && isSubAdminRole(role)) {
    if (pathname.startsWith('/admin/permissions')) {
      const url = new URL('/admin', request.url);
      url.searchParams.set('access_denied', '1');
      return NextResponse.redirect(url);
    }

    const permissions = decodePermissionsCookie(
      request.cookies.get(ADMIN_PERMISSIONS_COOKIE)?.value,
    );

    if (!permissions || permissions.length === 0) {
      if (pathname === '/admin') {
        return NextResponse.next();
      }
      const url = new URL('/admin', request.url);
      url.searchParams.set('access_denied', '1');
      return NextResponse.redirect(url);
    }

    if (!canAccessAdminPath(pathname, permissions)) {
      const url = new URL('/admin', request.url);
      url.searchParams.set('access_denied', '1');
      return NextResponse.redirect(url);
    }
  }

  if (isDashboardRoute && isAdminPanelRole(role)) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon/|apple-touch-icon.png|site.webmanifest|api/).*)'],
};
