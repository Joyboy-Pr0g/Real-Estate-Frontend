export const AUTH_COOKIE_NAME = 'auth_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

export type TokenRole = 'buyer' | 'office' | 'platform_admin' | 'sub_admin';

export function decodeTokenRole(token: string): TokenRole | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as {
      role?: string;
      exp?: number;
    };
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    const role = payload.role;
    if (
      role === 'buyer' ||
      role === 'office' ||
      role === 'platform_admin' ||
      role === 'sub_admin'
    ) {
      return role;
    }
    return null;
  } catch {
    return null;
  }
}

export function isPlatformAdminRole(role: TokenRole | null): role is 'platform_admin' {
  return role === 'platform_admin';
}

export function isSubAdminRole(role: TokenRole | null): role is 'sub_admin' {
  return role === 'sub_admin';
}

export function isAdminPanelRole(role: TokenRole | null): role is 'platform_admin' | 'sub_admin' {
  return role === 'platform_admin' || role === 'sub_admin';
}

export function getRoleHomePath(role: TokenRole | string): string {
  if (role === 'platform_admin' || role === 'sub_admin') return '/admin';
  if (role === 'office' || role === 'buyer') return '/dashboard';
  return '/';
}
