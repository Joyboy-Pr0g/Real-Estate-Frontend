import { env } from '@/env';

/** Matches backend `AUTH_EMAIL_SEND_COOLDOWN_SEC` / Redis send cooldown. */
export const AUTH_EMAIL_SEND_COOLDOWN_SECONDS = env.NEXT_PUBLIC_AUTH_EMAIL_SEND_COOLDOWN_SEC;

const STORAGE_PREFIX = 'auth:email-send-cooldown:';

function storageKey(email: string): string {
  return `${STORAGE_PREFIX}${email.toLowerCase().trim()}`;
}

export function formatEmailSendCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function markEmailCodeSent(email: string): void {
  if (typeof sessionStorage === 'undefined') return;
  const normalized = email.toLowerCase().trim();
  if (!normalized) return;
  sessionStorage.setItem(storageKey(normalized), String(Date.now()));
}

export function getEmailSendCooldownRemaining(email: string): number {
  if (typeof sessionStorage === 'undefined') return 0;
  const normalized = email.toLowerCase().trim();
  if (!normalized) return 0;

  const raw = sessionStorage.getItem(storageKey(normalized));
  if (!raw) return 0;

  const elapsedSec = Math.floor((Date.now() - Number.parseInt(raw, 10)) / 1000);
  return Math.max(0, AUTH_EMAIL_SEND_COOLDOWN_SECONDS - elapsedSec);
}
