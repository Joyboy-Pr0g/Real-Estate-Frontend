import { setAuthCookie } from '@/lib/auth/session';
import { AuthLoginResponse, AuthUser } from '@/features/auth/types/user';

export function toAuthUser(data: AuthLoginResponse): AuthUser {
  const { token: _token, refreshToken: _refresh, ...user } = data;
  return user;
}

export async function setSessionFromAuthResponse(data: AuthLoginResponse): Promise<AuthUser> {
  await setAuthCookie(data.token);
  return toAuthUser(data);
}
