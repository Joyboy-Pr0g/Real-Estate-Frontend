export type UserRole = 'buyer' | 'office' | 'platform_admin' | 'sub_admin';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface UserPhoto {
  url: string;
  public_id: string;
}

export interface AuthUser {
  id: string;
  f_name: string;
  l_name: string;
  email: string;
  email_verified_at: string | null;
  phone_number: string;
  user_photo?: UserPhoto | null;
  role: UserRole;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  token: string;
  refreshToken: string;
  id: string;
  f_name: string;
  l_name: string;
  email: string;
  email_verified_at: string | null;
  phone_number: string;
  role: UserRole;
  status: UserStatus;
}

export interface CreateUserPayload {
  f_name: string;
  l_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
}

export interface AdminUserListItem {
  id: string;
  f_name: string;
  l_name: string;
  email: string;
  email_verified_at: string | null;
  phone_number: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AdminUsersPage {
  items: AdminUserListItem[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface AdminUserSearchParams {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  cursor?: string;
  limit?: number;
  include_deleted?: boolean;
}
