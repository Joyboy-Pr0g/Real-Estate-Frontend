import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { AuthUser } from '@/features/auth/types/user';
import { UserPermissionAccess } from '@/features/admin/types/permission';
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  REFRESHED_ACCESS_TOKEN_HEADER,
} from '@/lib/auth/constants';
import {
  ADMIN_PERMISSIONS_COOKIE,
  decodePermissionsCookie,
  encodePermissionsCookie,
} from '@/lib/auth/admin-route-permissions';
import {
  ACCESS_TOKEN_MAX_AGE_SEC,
  REFRESH_TOKEN_MAX_AGE_SEC,
  decodeJwtPayload,
  isAccessTokenExpired,
} from '@/lib/auth/token-config';

interface TokenPairResponse {
  token: string;
  refreshToken: string;
}

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

const adminPermissionsCookieOptions = {
  httpOnly: true,
  secure: secureCookies,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ACCESS_TOKEN_MAX_AGE_SEC,
};

export async function getRawAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, authCookieOptions);
}

export async function setRefreshCookie(refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
}

export async function setSessionCookies(token: string, refreshToken: string): Promise<void> {
  await setAuthCookie(token);
  await setRefreshCookie(refreshToken);
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function clearRefreshCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_COOKIE_NAME);
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
  await clearRefreshCookie();
  await clearAdminPermissionsCookie();
}

export async function refreshSession(): Promise<string | undefined> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return undefined;
  }

  try {
    const response = await fetchBackend<TokenPairResponse>(backendPaths.auth.refreshToken, {
      method: 'POST',
      body: { refreshToken },
      cacheProfile: 'none',
    });

    const tokens = response.data;
    if (!tokens?.token || !tokens.refreshToken) {
      await clearSession();
      return undefined;
    }

    await setSessionCookies(tokens.token, tokens.refreshToken);

    if (decodeJwtPayload(tokens.token)?.role === 'sub_admin') {
      await syncAdminPermissionsCookie(tokens.token);
    }

    return tokens.token;
  } catch {
    await clearSession();
    return undefined;
  }
}

interface GetAuthTokenOptions {
  /** When true, may rotate tokens and write cookies. Use only in Route Handlers or Server Actions. */
  refresh?: boolean;
}

/**
 * Returns a valid access token for the current request.
 * Server Components must use the default read-only mode (no cookie writes).
 */
export async function getAuthToken(options?: GetAuthTokenOptions): Promise<string | undefined> {
  if (!options?.refresh) {
    const headerStore = await headers();
    const middlewareToken = headerStore.get(REFRESHED_ACCESS_TOKEN_HEADER);
    if (middlewareToken) {
      return middlewareToken;
    }
  }

  const accessToken = await getRawAuthToken();
  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return accessToken;
  }

  if (options?.refresh) {
    return refreshSession();
  }

  return undefined;
}

/** Fetches sub-admin permissions and writes the proxy cookie. */
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
