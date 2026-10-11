import type { NextRequest } from 'next/server';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

export function getTurnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
}

/** Prefer server-only TURNSTILE_SECRET_KEY; NEXT_PUBLIC fallback for local dev only. */
export function getTurnstileSecretKey(): string | undefined {
  return (
    process.env.TURNSTILE_SECRET_KEY?.trim()
    || process.env.NEXT_PUBLIC_TURNSTILE_SECRET_KEY?.trim()
    || undefined
  );
}

export function isTurnstileConfigured(): boolean {
  return Boolean(getTurnstileSiteKey() && getTurnstileSecretKey());
}

export function getClientIp(request: NextRequest): string | undefined {
  return (
    request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || undefined
  );
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isTurnstileConfigured()) {
    return { ok: true };
  }

  if (!token?.trim()) {
    return { ok: false, message: 'Security verification required. Please complete the check and try again.' };
  }

  const form = new URLSearchParams();
  form.set('secret', getTurnstileSecretKey()!);
  form.set('response', token.trim());
  if (remoteIp) {
    form.set('remoteip', remoteIp);
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    const data = (await response.json()) as TurnstileVerifyResponse;
    if (data.success) {
      return { ok: true };
    }
  } catch {
    return { ok: false, message: 'Security verification failed. Please try again.' };
  }

  return { ok: false, message: 'Security verification failed. Please try again.' };
}

export async function assertTurnstileFromBody(
  body: Record<string, unknown>,
  request: NextRequest,
): Promise<{ ok: true; payload: Record<string, unknown> } | { ok: false; message: string }> {
  const { turnstileToken, ...payload } = body;
  const verification = await verifyTurnstileToken(
    typeof turnstileToken === 'string' ? turnstileToken : undefined,
    getClientIp(request),
  );

  if (!verification.ok) {
    return verification;
  }

  return { ok: true, payload };
}
