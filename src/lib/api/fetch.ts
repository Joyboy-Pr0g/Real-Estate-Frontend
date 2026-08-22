import { env } from '@/env';
import { ApiResponse } from '@/lib/types/api';
import { ApiError } from '@/lib/errors/api-error';
import { parseApiResponse } from '@/lib/api/parse-response';
import { CACHE, type CacheProfile } from '@/lib/api/cache';

export interface FetchBackendOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  cacheProfile?: CacheProfile;
  revalidate?: number;
  searchParams?: Record<string, string | number | boolean | undefined>;
  body?: BodyInit | Record<string, unknown> | null;
}

function buildUrl(path: string, searchParams?: FetchBackendOptions['searchParams']): string {
  const base = path.startsWith('http') ? path : `${env.BACKEND_URL}${path}`;
  const url = new URL(base);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function resolveFetchCache(options: FetchBackendOptions): Pick<RequestInit, 'cache' | 'next'> {
  const profile = options.cacheProfile ?? 'short';
  const seconds = options.revalidate ?? CACHE[profile];

  if (seconds <= 0) {
    return { cache: 'no-store' };
  }

  return { next: { revalidate: seconds } };
}

function prepareBody(body: FetchBackendOptions['body']): BodyInit | null {
  if (body === undefined || body === null) return null;
  if (body instanceof FormData || body instanceof URLSearchParams || typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body);
}

export async function fetchBackend<T = unknown>(
  path: string,
  options: FetchBackendOptions = {},
): Promise<ApiResponse<T>> {
  const { token, searchParams, headers, body, ...rest } = options;
  const preparedBody = prepareBody(body);
  const isJsonBody = preparedBody !== null && !(body instanceof FormData);
  const fetchCache = resolveFetchCache(options);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, searchParams), {
      ...rest,
      ...fetchCache,
      body: preparedBody,
      headers: {
        Accept: 'application/json',
        ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError('الخدمة غير متاحة', 503);
  }

  return parseApiResponse<T>(response);
}
