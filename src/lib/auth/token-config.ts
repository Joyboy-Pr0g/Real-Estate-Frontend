import { env } from '@/env';

export const ACCESS_TOKEN_MAX_AGE_SEC = env.ACCESS_TOKEN_MAX_AGE_SEC;
export const REFRESH_TOKEN_MAX_AGE_SEC = env.REFRESH_TOKEN_MAX_AGE_SEC;

export function decodeJwtPayload(token: string): { exp?: number; role?: string } | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof Buffer !== 'undefined'
        ? Buffer.from(normalized, 'base64').toString('utf8')
        : atob(normalized);
    return JSON.parse(json) as { exp?: number; role?: string };
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string, skewSec = 30): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now() + skewSec * 1000;
}
