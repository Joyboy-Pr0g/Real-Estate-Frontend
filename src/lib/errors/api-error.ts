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
} as const;

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

export function isEmailNotVerifiedError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const details = err.details as { code?: string } | undefined;
  if (details?.code === AUTH_ERROR_CODE.EMAIL_NOT_VERIFIED) return true;
  return err.status === 403 && err.message.includes('غير مُحقق');
}
