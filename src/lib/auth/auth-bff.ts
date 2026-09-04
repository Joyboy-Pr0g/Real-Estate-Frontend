import { setAuthCookie, syncAdminPermissionsCookie, clearAdminPermissionsCookie } from '@/lib/auth/session';
import { AuthLoginResponse, AuthUser } from '@/features/auth/types/user';

export function toAuthUser(data: AuthLoginResponse): AuthUser {
  const { token: _token, refreshToken: _refresh, ...user } = data;
  return user;
}

export async function setSessionFromAuthResponse(data: AuthLoginResponse): Promise<AuthUser> {
  await setAuthCookie(data.token);
  const user = toAuthUser(data);

  if (user.role === 'sub_admin') {
    await syncAdminPermissionsCookie(data.token);
  } else {
    await clearAdminPermissionsCookie();
  }

  return user;
}
