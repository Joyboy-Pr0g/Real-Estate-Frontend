'use client';

import { createContext, useContext, useMemo } from 'react';
import { UserPermissionAccess } from '@/features/admin/types/permission';
import { AuthUser } from '@/features/auth/types/user';
import { hasPermissionName } from '@/lib/auth/admin-route-permissions';

interface PermissionsContextValue {
  user: AuthUser;
  permissions: UserPermissionAccess[];
  isPlatformAdmin: boolean;
  isSubAdmin: boolean;
  hasPermission: (permissionName: string) => boolean;
  allowedPaths: Set<string>;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

interface PermissionsProviderProps {
  user: AuthUser;
  permissions: UserPermissionAccess[];
  children: React.ReactNode;
}

export function PermissionsProvider({ user, permissions, children }: PermissionsProviderProps) {
  const value = useMemo<PermissionsContextValue>(() => {
    const isPlatformAdmin = user.role === 'platform_admin';
    const isSubAdmin = user.role === 'sub_admin';
    const allowedPaths = new Set(
      isPlatformAdmin
        ? [
            '/admin',
            '/admin/users',
            '/admin/offices',
            '/admin/offices/pending',
            '/admin/individual-listers',
            '/admin/individual-listers/pending',
            '/admin/listings',
            '/admin/reports',
            '/admin/office-action-logs',
            '/admin/property-types',
            '/admin/property-subtypes',
            '/admin/transaction-types',
            '/admin/features',
            '/admin/sub-features',
            '/admin/cities',
            '/admin/neighborhoods',
            '/admin/permissions',
          ]
        : permissions.map((p) => p.path.replace(/\/+$/, '') || '/admin'),
    );

    return {
      user,
      permissions,
      isPlatformAdmin,
      isSubAdmin,
      allowedPaths,
      hasPermission: (permissionName: string) =>
        isPlatformAdmin || hasPermissionName(permissions, permissionName),
    };
  }, [permissions, user]);

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return ctx;
}

export function useOptionalPermissions(): PermissionsContextValue | null {
  return useContext(PermissionsContext);
}
