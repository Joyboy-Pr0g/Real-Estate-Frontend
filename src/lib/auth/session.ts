import { cache } from 'react';
import { cookies } from 'next/headers';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { AuthUser } from '@/features/auth/types/user';
import { UserPermissionAccess } from '@/features/admin/types/permission';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import {
  ADMIN_PERMISSIONS_COOKIE,
  decodePermissionsCookie,
  encodePermissionsCookie,
} from '@/lib/auth/admin-route-permissions';

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24,
};

const adminPermissionsCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24,
};

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, authCookieOptions);
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getAdminPermissionsCookie(): Promise<UserPermissionAccess[] | null> {
  const cookieStore = await cookies();
  return decodePermissionsCookie(cookieStore.get(ADMIN_PERMISSIONS_COOKIE)?.value);
}

export async function setAdminPermissionsCookie(
  permissions: UserPermissionAccess[],
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_PERMISSIONS_COOKIE,
    encodePermissionsCookie(permissions),
    adminPermissionsCookieOptions,
  );
}

export async function clearAdminPermissionsCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_PERMISSIONS_COOKIE);
}

export async function clearSession(): Promise<void> {
  await clearAuthCookie();
  await clearAdminPermissionsCookie();
}

/**
 * Fetches sub-admin permissions and writes the proxy cookie.
 * Call only from Route Handlers or Server Actions.
 */
export async function syncAdminPermissionsCookie(token?: string): Promise<UserPermissionAccess[]> {
  const authToken = token ?? (await getAuthToken());
  if (!authToken) {
    await clearAdminPermissionsCookie();
    return [];
  }

  try {
    const response = await fetchBackend<UserPermissionAccess[]>(backendPaths.auth.permissionsMe, {
      token: authToken,
      cacheProfile: 'none',
    });
    const permissions = response.data ?? [];
    await setAdminPermissionsCookie(permissions);
    return permissions;
  } catch {
    await clearAdminPermissionsCookie();
    return [];
  }
}

export const getSession = cache(async (): Promise<AuthUser | null> => {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await fetchBackend<AuthUser>(backendPaths.auth.me, {
      token,
      cacheProfile: 'none',
    });
    return response.data ?? null;
  } catch {
    return null;
  }
});

/**
 * Sub-admin permissions for RSC (layout/provider).
 * Read-only — cookie sync happens via login, BFF /permissions/me, or AdminPermissionsCookieSync.
 */
export const getSubAdminPermissions = cache(async (): Promise<UserPermissionAccess[]> => {
  const user = await getSession();
  if (!user || user.role !== 'sub_admin') {
    return [];
  }

  const token = await getAuthToken();
  if (!token) return [];

  try {
    const response = await fetchBackend<UserPermissionAccess[]>(backendPaths.auth.permissionsMe, {
      token,
      cacheProfile: 'none',
    });
    return response.data ?? [];
  } catch {
    return [];
  }
});
