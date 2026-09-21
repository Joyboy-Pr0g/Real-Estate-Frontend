'use client';

import { env } from '@/env';
import { bffPaths } from '@/lib/api/endpoints';
import { parseApiResponse } from '@/lib/api/parse-response';
import { ApiResponse } from '@/lib/types/api';
import { ApiError } from '@/lib/errors/api-error';

function buildBackendUrl(path: string): string {
  const base = env.BACKEND_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

async function fetchAccessToken(retried = false): Promise<string> {
  const response = await fetch('/api/auth/access-token', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (response.status === 401 && !retried) {
    const refreshed = await fetch(bffPaths.auth.refreshToken, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (refreshed.ok) {
      return fetchAccessToken(true);
    }
  }

  const json = await parseApiResponse<{ token: string }>(response);
  const token = json.data?.token;
  if (!token) {
    throw new ApiError('Unauthorized', 401);
  }
  return token;
}

async function revalidateListingsMarketplaceClient(listingId?: string): Promise<void> {
  const query = listingId ? `?listingId=${encodeURIComponent(listingId)}` : '';
  try {
    await fetch(`/api/listings/revalidate-marketplace${query}`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Best-effort cache refresh after mutation.
  }
}

export async function clientMultipartBackend<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PUT' | 'PATCH',
  options?: { revalidateListingId?: string },
): Promise<ApiResponse<T>> {
  const token = await fetchAccessToken();
  const response = await fetch(buildBackendUrl(path), {
    method,
    body: formData,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const parsed = await parseApiResponse<T>(response);

  let listingId = options?.revalidateListingId;
  if (!listingId && parsed.data && typeof parsed.data === 'object' && 'id' in parsed.data) {
    const id = (parsed.data as { id?: unknown }).id;
    if (typeof id === 'string' && id.length > 0) {
      listingId = id;
    }
  }
  await revalidateListingsMarketplaceClient(listingId);

  return parsed;
}
