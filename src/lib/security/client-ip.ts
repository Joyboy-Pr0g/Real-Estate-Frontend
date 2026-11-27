import 'server-only';
import { isIP } from 'node:net';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

export const CLIENT_IP_HEADER = 'x-real-ip';

function normalizeClientIp(value: string | null): string | undefined {
  const ip = value?.trim();
  return ip && isIP(ip) ? ip : undefined;
}

export function getClientIp(request: NextRequest): string | undefined {
  return normalizeClientIp(request.headers.get(CLIENT_IP_HEADER));
}

export async function getRequestClientIp(): Promise<string | undefined> {
  const headerStore = await headers();
  return normalizeClientIp(headerStore.get(CLIENT_IP_HEADER));
}
