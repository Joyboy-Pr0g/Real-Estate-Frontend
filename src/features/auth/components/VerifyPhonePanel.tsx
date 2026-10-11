'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getPhoneVerificationStatus } from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { PhoneVerificationStatus } from '@/features/auth/types/user';
import { finalizePendingPhoneVerification } from '@/lib/auth/pending-phone-verification';

const POLL_MS = 3000;
const TERMINAL: PhoneVerificationStatus[] = ['verified', 'expired', 'phone_mismatch'];

export interface VerifyPhonePanelProps {
  sessionId: string;
  whatsAppLink: string;
  /** When set, success calls this instead of navigating away. */
  onVerified?: (phoneDigitKey: string | null) => void;
  redirectAfterVerify?: string;
  label?: string;
  backUrl?: string;
  /** Modal mode: cancel button instead of link navigation. */
  onCancel?: () => void;
}

export function VerifyPhonePanel({
  sessionId,
  whatsAppLink,
  onVerified,
  redirectAfterVerify,
  label = 'العودة إلى التسجيل',
  backUrl = '/login',
  onCancel,
}: VerifyPhonePanelProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [status, setStatus] = useState<PhoneVerificationStatus>('pending');
  const [error, setError] = useState('');
  const onVerifiedRef = useRef<typeof onVerified | null>(null);

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  useEffect(() => {
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (cancelled) return;

      try {
        const result = await getPhoneVerificationStatus(sessionId);
        if (cancelled) return;

        setStatus(result.status);

        if (result.status === 'verified' && result.phone_verified) {
          const digitKey = finalizePendingPhoneVerification();
          if (onVerifiedRef.current) {
            onVerifiedRef.current(digitKey);
            return;
          }
          const target = redirectAfterVerify ?? '/login';
          router.push(target);
          router.refresh();
          return;
        }

        if (TERMINAL.includes(result.status)) {
          return;
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
        return;
      }

      timerId = setTimeout(() => {
        void tick();
      }, POLL_MS);
    };

    void tick();

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [redirectAfterVerify, router, sessionId]);

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <p className="text-sm leading-relaxed text-gray-600">{t('auth.verifyPhoneInstructions')}</p>

      <Button asChild size="lg" className="w-full rounded-xl">
        <a href={whatsAppLink} target="_blank" rel="noopener noreferrer">
          {t('auth.openWhatsApp')}
        </a>
      </Button>

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        {status === 'pending' ? t('auth.verifyPhoneWaiting') : null}
        {status === 'verified' ? t('auth.verifyPhoneSuccess') : null}
        {status === 'expired' ? t('auth.verifyPhoneExpired') : null}
        {status === 'phone_mismatch' ? t('auth.verifyPhoneMismatch') : null}
        {status === 'phone_unconfirmed' ? t('auth.verifyPhoneUnconfirmed') : null}
      </div>

      {onCancel ? (
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('admin.cancel')}
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">
          <Link href={backUrl} className="font-medium text-brand hover:text-brand-dark">
            {label}
          </Link>
        </p>
      )}
    </div>
  );
}
