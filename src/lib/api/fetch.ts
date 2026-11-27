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
  tags?: string[];
  clientIp?: string;
}

const FORWARDED_FOR_HEADER = 'X-Forwarded-For';

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

function resolveFetchCache(
  options: FetchBackendOptions,
  tags: string[] = [],
): Pick<RequestInit, 'cache' | 'next'> {
  const profile = options.cacheProfile ?? 'short';
  const seconds = options.revalidate ?? CACHE[profile];

  if (seconds <= 0) {
    return { cache: 'no-store', next: { tags } };
  }

  return { next: { revalidate: seconds, tags } };
}

function isUncachedFetch(fetchCache: Pick<RequestInit, 'cache' | 'next'>): boolean {
  return fetchCache.cache === 'no-store' && (fetchCache.next?.tags?.length ?? 0) === 0;
}

function buildHeaders(
  headers: HeadersInit | undefined,
  options: { isJsonBody: boolean; token?: string; clientIp?: string; uncached: boolean },
): Headers {
  const merged = new Headers({ Accept: 'application/json' });
  if (options.isJsonBody) {
    merged.set('Content-Type', 'application/json');
  }
  if (options.token) {
    merged.set('Authorization', `Bearer ${options.token}`);
  }
  new Headers(headers).forEach((value, key) => merged.set(key, value));

  merged.delete(FORWARDED_FOR_HEADER);
  if (options.uncached && options.clientIp) {
    merged.set(FORWARDED_FOR_HEADER, options.clientIp);
  }
  return merged;
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
  const { token, searchParams, headers, body, clientIp, ...rest } = options;
  const preparedBody = prepareBody(body);
  const isJsonBody = preparedBody !== null && !(body instanceof FormData);
  const fetchCache = resolveFetchCache(options, options.tags ?? []);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, searchParams), {
      ...rest,
      ...fetchCache,
      body: preparedBody,
      headers: buildHeaders(headers, {
        isJsonBody,
        token,
        clientIp,
        uncached: isUncachedFetch(fetchCache),
      }),
    });
  } catch {
    throw new ApiError('الخدمة غير متاحة', 503);
  }

  return parseApiResponse<T>(response);
}
