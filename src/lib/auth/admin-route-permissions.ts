import { UserPermissionAccess } from '@/features/admin/types/permission';

/** Maps admin routes to the `{resource}.view` permission required for page access. */
export const ADMIN_ROUTE_VIEW_PERMISSION: Record<string, string> = {
  '/admin': 'dashboard.view',
  '/admin/users': 'users.view',
  '/admin/offices': 'offices.view',
  '/admin/offices/pending': 'offices.view',
  '/admin/individual-listers': 'individual_listers.view',
  '/admin/individual-listers/pending': 'individual_listers.view',
  '/admin/listings': 'listings.view',
  '/admin/reports': 'listing_reports.view',
  '/admin/office-action-logs': 'office_action_logs.view',
  '/admin/property-types': 'property_types.view',
  '/admin/property-subtypes': 'property_subtypes.view',
  '/admin/transaction-types': 'transaction_types.view',
  '/admin/features': 'main_features.view',
  '/admin/sub-features': 'sub_features.view',
  '/admin/cities': 'cities.view',
  '/admin/neighborhoods': 'neighborhoods.view',
  '/admin/announcements': 'announcements.view',
  '/admin/website-settings': 'website_settings.view',
  '/admin/permissions': 'dashboard.view',
};

export function resolveAdminPathname(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/admin';
  if (ADMIN_ROUTE_VIEW_PERMISSION[normalized]) {
    return normalized;
  }

  const segments = normalized.split('/');
  while (segments.length > 2) {
    segments.pop();
    const candidate = segments.join('/') || '/admin';
    if (ADMIN_ROUTE_VIEW_PERMISSION[candidate]) {
      return candidate;
    }
  }

  return '/admin';
}

export function canAccessAdminPath(
  pathname: string,
  permissions: UserPermissionAccess[],
): boolean {
  const basePath = resolveAdminPathname(pathname);
  const allowedPaths = new Set(permissions.map((p) => p.path.replace(/\/+$/, '') || '/admin'));
  if (!allowedPaths.has(basePath)) {
    return false;
  }

  const viewPermission = ADMIN_ROUTE_VIEW_PERMISSION[basePath];
  if (!viewPermission) {
    return false;
  }

  return permissions.some((p) => p.name === viewPermission);
}

export function hasPermissionName(
  permissions: UserPermissionAccess[],
  permissionName: string,
): boolean {
  return permissions.some((p) => p.name === permissionName);
}

export const ADMIN_PERMISSIONS_COOKIE = 're_admin_perms';

export function encodePermissionsCookie(permissions: UserPermissionAccess[]): string {
  return Buffer.from(JSON.stringify(permissions)).toString('base64url');
}

export function decodePermissionsCookie(value: string | undefined): UserPermissionAccess[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (item): item is UserPermissionAccess =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as UserPermissionAccess).name === 'string' &&
        typeof (item as UserPermissionAccess).path === 'string',
    );
  } catch {
    return null;
  }
}
