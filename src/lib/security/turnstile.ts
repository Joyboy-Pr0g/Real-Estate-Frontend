import 'server-only';
import type { NextRequest } from 'next/server';
import { getClientIp } from '@/lib/security/client-ip';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

type TurnstileResult = { ok: true } | { ok: false; message: string };

const VERIFICATION_FAILED_MESSAGE = 'Security verification failed. Please try again.';
const VERIFICATION_UNAVAILABLE_MESSAGE = 'Security verification is unavailable. Please try again later.';

function getTurnstileSecretKey(): string | undefined {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || undefined;
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const secret = getTurnstileSecretKey();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, message: VERIFICATION_UNAVAILABLE_MESSAGE };
    }
    return { ok: true };
  }

  if (!token?.trim()) {
    return { ok: false, message: 'Security verification required. Please complete the check and try again.' };
  }

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token.trim());
  if (remoteIp) {
    form.set('remoteip', remoteIp);
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      cache: 'no-store',
    });

    const data = (await response.json()) as TurnstileVerifyResponse;
    if (data.success) {
      return { ok: true };
    }
  } catch {
    return { ok: false, message: VERIFICATION_FAILED_MESSAGE };
  }

  return { ok: false, message: VERIFICATION_FAILED_MESSAGE };
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
