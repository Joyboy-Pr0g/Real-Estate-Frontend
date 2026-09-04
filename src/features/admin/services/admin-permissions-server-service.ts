import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import {
  PermissionRecord,
  SubAdminPermissionAssignment,
  UserPermissionAccess,
} from '@/features/admin/types/permission';

async function adminPermissionsFetch<T>(
  path: string,
  searchParams?: Record<string, string>,
): Promise<T[]> {
  const token = await getAuthToken();
  if (!token) return [];

  const response = await serverFetch<T[]>(path, {
    token,
    cacheProfile: 'none',
    searchParams,
  });

  return response.data ?? [];
}

export async function getMyPermissionsServer(): Promise<UserPermissionAccess[]> {
  return adminPermissionsFetch<UserPermissionAccess>(backendPaths.auth.permissionsMe);
}

export async function getAllPermissionsServer(): Promise<PermissionRecord[]> {
  return adminPermissionsFetch<PermissionRecord>(backendPaths.auth.permissions);
}

export async function getPermissionAssignmentsServer(params?: {
  user_id?: string;
  permission_id?: string;
}): Promise<SubAdminPermissionAssignment[]> {
  const searchParams: Record<string, string> = {};
  if (params?.user_id) searchParams.user_id = params.user_id;
  if (params?.permission_id) searchParams.permission_id = params.permission_id;

  return adminPermissionsFetch<SubAdminPermissionAssignment>(
    backendPaths.auth.permissionAssignments,
    searchParams,
  );
}
