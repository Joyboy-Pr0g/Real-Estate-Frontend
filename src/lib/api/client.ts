'use client';

import { ApiResponse } from '@/lib/types/api';
import { ApiError, getErrorMessage } from '@/lib/errors/api-error';
import { parseApiResponse } from '@/lib/api/parse-response';

export { getErrorMessage };

interface ClientFetchOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | Record<string, unknown> | null;
  searchParams?: Record<string, string | number | boolean | undefined>;
  params?: Record<string, string>;
}

function buildClientUrl(path: string, searchParams?: ClientFetchOptions['searchParams']): string {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, window.location.origin);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function prepareClientBody(body: ClientFetchOptions['body']): BodyInit | undefined {
  if (body === null || body === undefined) return undefined;
  if (body instanceof FormData || body instanceof URLSearchParams || typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body);
}

export async function clientFetch<T = unknown>(
  path: string,
  options: ClientFetchOptions = {},
): Promise<ApiResponse<T>> {
  let resolvedPath = path;
  if (options.params) {
    const qs = new URLSearchParams(options.params);
    resolvedPath = `${path}?${qs}`;
  }

  const { body, searchParams, headers, params: _params, ...rest } = options;
  const preparedBody = prepareClientBody(body);
  const isJsonBody = preparedBody !== undefined && !(body instanceof FormData);

  const response = await fetch(buildClientUrl(resolvedPath, searchParams), {
    ...rest,
    body: preparedBody,
    headers: {
      Accept: 'application/json',
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    credentials: 'include',
  });

  return parseApiResponse<T>(response);
}
