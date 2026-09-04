export interface UserPermissionAccess {
  name: string;
  path: string;
}

export interface PermissionRecord {
  id: string;
  name: string;
  display_name: string;
  resource: string;
  action: string;
  path: string;
}

export interface SubAdminPermissionAssignment {
  user_id: string;
  f_name: string;
  l_name: string;
  email: string;
  permissions: PermissionRecord[];
}

export interface AssignPermissionPayload {
  user_id: string;
  permission_id: string;
}

export interface AssignPermissionsBulkPayload {
  user_id: string;
  permission_ids: string[];
}

export interface PermissionFormPayload {
  name: string;
  display_name: string;
  resource: string;
  action: string;
  path: string;
}
