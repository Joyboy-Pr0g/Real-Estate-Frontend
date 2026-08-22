import { fetchBackend, FetchBackendOptions } from '@/lib/api/fetch';
import { ApiResponse } from '@/lib/types/api';
import { ApiError } from '@/lib/errors/api-error';

export type ServerFetchOptions = FetchBackendOptions;

export async function serverFetch<T = unknown>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<ApiResponse<T>> {
  try {
    return await fetchBackend<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('الخدمة غير متاحة', 503);
  }
}
