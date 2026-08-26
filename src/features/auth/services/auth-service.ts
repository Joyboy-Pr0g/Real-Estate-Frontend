'use client';

import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  SendCodeInput,
  UpdateProfileInput,
  VerifyEmailInput,
} from '@/features/auth/schemas/auth-schemas';
import { AuthUser, CreateUserPayload, UserRole } from '@/features/auth/types/user';
import { bffPaths } from '@/lib/api/endpoints';
import { clientFetch } from '@/lib/api/client';

interface AuthUserResponse {
  user: AuthUser;
}

export async function login(data: LoginInput): Promise<AuthUser> {
  const res = await clientFetch<AuthUserResponse>(bffPaths.auth.login, {
    method: 'POST',
    body: data,
  });
  return res.data!.user;
}

export async function register(data: RegisterInput): Promise<AuthUser> {
  const res = await clientFetch<AuthUserResponse>(bffPaths.auth.register, {
    method: 'POST',
    body: data,
  });
  return res.data!.user;
}

export async function logout(): Promise<void> {
  await clientFetch(bffPaths.auth.logout, { method: 'POST' });
}

export async function getMe(): Promise<AuthUser> {
  const res = await clientFetch<AuthUser>(bffPaths.auth.me);
  return res.data!;
}

export async function updateProfile(data: Partial<UpdateProfileInput>): Promise<void> {
  await clientFetch(bffPaths.auth.me, { method: 'PATCH', body: data });
}

export async function verifyEmail(data: VerifyEmailInput): Promise<void> {
  await clientFetch(bffPaths.auth.verifyEmail, {
    method: 'POST',
    body: data,
  });
}

export async function forgotPassword(data: ForgotPasswordInput): Promise<void> {
  await clientFetch(bffPaths.auth.forgotPassword, {
    method: 'POST',
    body: data,
  });
}

export async function sendVerificationCode(data: SendCodeInput): Promise<void> {
  await clientFetch(bffPaths.auth.sendCode, {
    method: 'POST',
    body: data,
  });
}

export async function changePassword(data: ChangePasswordInput): Promise<void> {
  await clientFetch(bffPaths.auth.changePassword, {
    method: 'POST',
    body: data,
  });
}

export async function refreshToken(refreshTokenValue: string): Promise<void> {
  await clientFetch(bffPaths.auth.refreshToken, {
    method: 'POST',
    body: { refreshToken: refreshTokenValue },
  });
}

export async function createAdminUser(payload: CreateUserPayload): Promise<AuthUser> {
  const res = await clientFetch<AuthUser>(bffPaths.admin.users, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data!;
}

export async function activateUser(userId: string): Promise<void> {
  await clientFetch(bffPaths.admin.activateUser(userId), { method: 'PATCH' });
}

export async function deactivateUser(userId: string): Promise<void> {
  await clientFetch(bffPaths.admin.deactivateUser(userId), { method: 'PATCH' });
}

export type AssignableUserRole = Exclude<UserRole, 'platform_admin'>;

export async function changeUserRole(userId: string, role: AssignableUserRole): Promise<void> {
  await clientFetch(bffPaths.admin.changeUserRole(userId), { method: 'PATCH', body: { role } });
}

export async function changeUserPassword(userId: string): Promise<void> {
  await clientFetch(bffPaths.admin.changeUserPassword(userId), { method: 'PATCH' });
}

export async function softDeleteUser(userId: string): Promise<void> {
  await clientFetch(bffPaths.admin.softDeleteUser(userId), { method: 'POST' });
}

export async function restoreUser(userId: string): Promise<void> {
  await clientFetch(bffPaths.admin.restoreUser(userId), { method: 'POST' });
}

export async function hardDeleteUser(userId: string): Promise<void> {
  await clientFetch(bffPaths.admin.userById(userId), { method: 'DELETE' });
}

export async function bulkDeleteUsers(ids: string[]): Promise<number> {
  const res = await clientFetch<{ deleted: number }>(bffPaths.admin.usersBulk, {
    method: 'DELETE',
    body: { ids },
  });
  return res.data?.deleted ?? 0;
}

export async function loadMoreUsers(params: Record<string, string>): Promise<{
  items: import('@/features/auth/types/user').AdminUserListItem[];
  next_cursor: string | null;
  has_more: boolean;
}> {
  const res = await clientFetch<import('@/features/auth/types/user').AdminUserListItem[]>(
    bffPaths.admin.users,
    { searchParams: params },
  );

  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: Boolean(res.has_more),
  };
}
