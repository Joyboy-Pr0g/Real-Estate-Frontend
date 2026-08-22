export const AUTH_COOKIE_NAME = 'auth_token';

export type TokenRole = 'buyer' | 'office' | 'platform_admin';

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
    if (role === 'buyer' || role === 'office' || role === 'platform_admin') {
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
