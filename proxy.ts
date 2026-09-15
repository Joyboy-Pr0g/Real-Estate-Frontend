import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  decodeTokenRole,
  isAdminPanelRole,
  isSubAdminRole,
} from '@/lib/auth/constants';
import {
  ADMIN_PERMISSIONS_COOKIE,
  canAccessAdminPath,
  decodePermissionsCookie,
} from '@/lib/auth/admin-route-permissions';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/verify-email';

  if (isAuthRoute && token) {
    const role = decodeTokenRole(token);
    if (role) {
      if (isAdminPanelRole(role) && pathname !== '/verify-email') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      if ((pathname === '/register' || pathname === '/login') && !isAdminPanelRole(role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else {
      const response = NextResponse.next();
      response.cookies.delete(AUTH_COOKIE_NAME);
      response.cookies.delete(ADMIN_PERMISSIONS_COOKIE);
      return response;
    }
  }

  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (!isAdminRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const role = decodeTokenRole(token);
  if (!role) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete(AUTH_COOKIE_NAME);
    response.cookies.delete(ADMIN_PERMISSIONS_COOKIE);
    return response;
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
