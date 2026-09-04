import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import {
  AssignPermissionPayload,
  AssignPermissionsBulkPayload,
  PermissionFormPayload,
  PermissionRecord,
  SubAdminPermissionAssignment,
  UserPermissionAccess,
} from '@/features/admin/types/permission';
import { SearchableSelectOption } from '@/components/ui/searchable-select';

export async function fetchMyPermissions(): Promise<UserPermissionAccess[]> {
  const res = await clientFetch<UserPermissionAccess[]>(bffPaths.admin.permissionsMe);
  return res.data ?? [];
}

export async function fetchAllPermissions(): Promise<PermissionRecord[]> {
  const res = await clientFetch<PermissionRecord[]>(bffPaths.admin.permissions);
  return res.data ?? [];
}

export async function fetchPermissionAssignments(params?: {
  user_id?: string;
  permission_id?: string;
  search?: string;
}): Promise<SubAdminPermissionAssignment[]> {
  const searchParams: Record<string, string> = {};
  if (params?.user_id) searchParams.user_id = params.user_id;
  if (params?.permission_id) searchParams.permission_id = params.permission_id;
  if (params?.search) searchParams.search = params.search;

  const res = await clientFetch<SubAdminPermissionAssignment[]>(
    bffPaths.admin.permissionAssignments,
    { searchParams },
  );
  return res.data ?? [];
}

export async function assignPermission(payload: AssignPermissionPayload): Promise<void> {
  await clientFetch(bffPaths.admin.permissionAssign, {
    method: 'POST',
    body: { ...payload },
  });
}

export async function assignPermissionsBulk(
  payload: AssignPermissionsBulkPayload,
): Promise<{ assigned_count: number }> {
  const res = await clientFetch<{ assigned_count: number }>(bffPaths.admin.permissionAssignBulk, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data ?? { assigned_count: 0 };
}

export async function fetchUserAssignedPermissionIds(userId: string): Promise<string[]> {
  const assignments = await fetchPermissionAssignments({ user_id: userId });
  return assignments[0]?.permissions.map((permission) => permission.id) ?? [];
}

export async function removePermission(payload: AssignPermissionPayload): Promise<void> {
  await clientFetch(bffPaths.admin.permissionAssign, {
    method: 'DELETE',
    body: { ...payload },
  });
}

export async function removeUserAssignment(userId: string): Promise<{ removed_count: number }> {
  const res = await clientFetch<{ removed_count: number }>(bffPaths.admin.permissionAssignUser, {
    method: 'DELETE',
    body: { user_id: userId },
  });
  return res.data ?? { removed_count: 0 };
}

export async function searchSubAdmins(query: string): Promise<SearchableSelectOption[]> {
  const res = await clientFetch<SearchableSelectOption[]>(bffPaths.admin.subAdminsSearch, {
    searchParams: query ? { q: query } : undefined,
  });
  return res.data ?? [];
}

export async function searchPermissions(query: string): Promise<SearchableSelectOption[]> {
  const permissions = await fetchAllPermissions();
  const term = query.trim().toLowerCase();
  return permissions
    .filter(
      (p) =>
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.display_name.toLowerCase().includes(term) ||
        p.resource.toLowerCase().includes(term),
    )
    .slice(0, 30)
    .map((p) => ({
      id: p.id,
      label: p.display_name,
      sublabel: p.name,
    }));
}

export async function createPermission(payload: PermissionFormPayload): Promise<PermissionRecord> {
  const res = await clientFetch<PermissionRecord>(bffPaths.admin.permissions, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data!;
}

export async function updatePermission(
  id: string,
  payload: Partial<PermissionFormPayload>,
): Promise<PermissionRecord> {
  const res = await clientFetch<PermissionRecord>(bffPaths.admin.permissionById(id), {
    method: 'PUT',
    body: { ...payload },
  });
  return res.data!;
}

export async function deletePermission(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.permissionById(id), { method: 'DELETE' });
}
