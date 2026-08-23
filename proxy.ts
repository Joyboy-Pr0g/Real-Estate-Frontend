import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, decodeTokenRole, isPlatformAdminRole } from '@/lib/auth/constants';

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
      if (isPlatformAdminRole(role) && pathname !== '/verify-email') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      if ((pathname === '/register' || pathname === '/login') && role !== 'platform_admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else {
      const response = NextResponse.next();
      response.cookies.delete(AUTH_COOKIE_NAME);
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
    return response;
  }

  if (isAdminRoute && !isPlatformAdminRole(role)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isDashboardRoute && isPlatformAdminRole(role)) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
