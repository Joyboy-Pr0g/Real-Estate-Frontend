'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AUTH_EMAIL_SEND_COOLDOWN_SECONDS,
  getEmailSendCooldownRemaining,
  markEmailCodeSent,
} from '@/lib/auth/email-send-cooldown';

export function useEmailSendCooldown(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!normalizedEmail) {
      setRemainingSeconds(0);
      return;
    }
    setRemainingSeconds(getEmailSendCooldownRemaining(normalizedEmail));
  }, [normalizedEmail]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timerId = window.setTimeout(() => {
      setRemainingSeconds(getEmailSendCooldownRemaining(normalizedEmail));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [remainingSeconds, normalizedEmail]);

  const startCooldown = useCallback(() => {
    if (!normalizedEmail) return;
    markEmailCodeSent(normalizedEmail);
    setRemainingSeconds(AUTH_EMAIL_SEND_COOLDOWN_SECONDS);
  }, [normalizedEmail]);

  const canSend = remainingSeconds === 0;

  const progress =
    AUTH_EMAIL_SEND_COOLDOWN_SECONDS > 0
      ? remainingSeconds / AUTH_EMAIL_SEND_COOLDOWN_SECONDS
      : 0;

  return {
    remainingSeconds,
    totalSeconds: AUTH_EMAIL_SEND_COOLDOWN_SECONDS,
    canSend,
    progress,
    startCooldown,
  };
}
