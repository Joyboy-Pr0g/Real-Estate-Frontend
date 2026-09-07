export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const AUTH_ERROR_CODE = {
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const details = err.details as { code?: string } | undefined;
    if (details?.code === AUTH_ERROR_CODE.SERVICE_UNAVAILABLE || err.status === 503) {
      return err.message || 'الخدمة غير متاحة مؤقتاً. يرجى المحاولة بعد قليل.';
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

export function isEmailNotVerifiedError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const details = err.details as { code?: string } | undefined;
  if (details?.code === AUTH_ERROR_CODE.EMAIL_NOT_VERIFIED) return true;
  return err.status === 403 && err.message.includes('غير مُحقق');
}
