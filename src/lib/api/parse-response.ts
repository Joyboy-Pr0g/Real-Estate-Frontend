import { ApiResponse } from '@/lib/types/api';
import { ApiError } from '@/lib/errors/api-error';

export async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!text.trim()) {
    throw new ApiError('Empty response', response.status);
  }

  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiError('Invalid JSON response', response.status);
  }

  if (!response.ok || !json.success) {
    throw new ApiError(json.message ?? 'Request failed', response.status, json.error?.details);
  }

  return json;
}
