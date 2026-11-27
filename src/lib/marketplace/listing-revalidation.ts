import 'server-only';
import { fetchBackend } from '@/lib/api/fetch';
import { backendPaths } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/errors/api-error';
import type { AuthUser } from '@/features/auth/types/user';
import type { UserPermissionAccess } from '@/features/admin/types/permission';

const LISTING_REVALIDATION_PERMISSIONS = new Set([
  'listings.edit',
  'listings.delete',
  'listings.soft_delete',
  'listings.restore',
  'listings.bulk_delete',
]);

export type ListingRevalidationAccess =
  | { status: 'allowed'; slug?: string }
  | { status: 'unauthorized' }
  | { status: 'forbidden' };

function readStringField(data: unknown, field: 'id' | 'slug'): string | undefined {
  if (!data || typeof data !== 'object' || !(field in data)) return undefined;
  const value = (data as Record<string, unknown>)[field];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function readListingId(data: unknown): string | undefined {
  return readStringField(data, 'id');
}

export function readListingSlug(data: unknown): string | undefined {
  return readStringField(data, 'slug');
}

export async function findPublicListingSlug(listingId: string): Promise<string | undefined> {
  try {
    const response = await fetchBackend(backendPaths.listings.getById(listingId), { cacheProfile: 'none' });
    return readListingSlug(response.data);
  } catch {
    return undefined;
  }
}

async function hasListingRevalidationPermission(token: string, clientIp?: string): Promise<boolean> {
  try {
    const response = await fetchBackend<UserPermissionAccess[]>(backendPaths.auth.permissionsMe, {
      token,
      cacheProfile: 'none',
      clientIp,
    });
    return (response.data ?? []).some((permission) => LISTING_REVALIDATION_PERMISSIONS.has(permission.name));
  } catch {
    return false;
  }
}

async function getVerifiedUser(token: string, clientIp?: string): Promise<AuthUser | null> {
  try {
    const response = await fetchBackend<AuthUser>(backendPaths.auth.me, {
      token,
      cacheProfile: 'none',
      clientIp,
    });
    return response.data ?? null;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

export async function resolveListingRevalidationAccess(
  token: string,
  listingId: string | undefined,
  clientIp?: string,
): Promise<ListingRevalidationAccess> {
  const user = await getVerifiedUser(token, clientIp);
  if (!user) {
    return { status: 'unauthorized' };
  }

  const isListingAdmin =
    user.role === 'platform_admin'
    || (user.role === 'sub_admin' && (await hasListingRevalidationPermission(token, clientIp)));

  if (isListingAdmin) {
    return { status: 'allowed', slug: listingId ? await findPublicListingSlug(listingId) : undefined };
  }

  if (!listingId) {
    return { status: 'forbidden' };
  }

  try {
    const response = await fetchBackend(backendPaths.listings.mine(listingId), {
      token,
      cacheProfile: 'none',
      clientIp,
    });
    return { status: 'allowed', slug: readListingSlug(response.data) };
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) {
      return { status: 'forbidden' };
    }
    throw error;
  }
}
