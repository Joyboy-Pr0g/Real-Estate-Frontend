const PENDING_TARGET_KEY = 'pending_phone_verify_target';
const VERIFIED_PHONE_KEY = 'whatsapp_verified_phone';

export function markPendingPhoneVerification(phone: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(PENDING_TARGET_KEY, phoneDigitsKey(phone));
}

export function consumeVerifiedPhone(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  const verified = sessionStorage.getItem(VERIFIED_PHONE_KEY);
  if (verified) {
    sessionStorage.removeItem(VERIFIED_PHONE_KEY);
  }
  return verified;
}

/** Moves pending → verified storage; returns the digit key when a pending phone existed. */
export function finalizePendingPhoneVerification(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  const pending = sessionStorage.getItem(PENDING_TARGET_KEY);
  if (pending) {
    sessionStorage.setItem(VERIFIED_PHONE_KEY, pending);
    sessionStorage.removeItem(PENDING_TARGET_KEY);
    return pending;
  }
  return null;
}

export function phoneDigitsKey(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.startsWith('967') ? cleaned : `967${cleaned}`;
}
