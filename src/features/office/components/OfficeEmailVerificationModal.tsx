'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { createVerifyEmailSchema } from '@/features/auth/schemas/auth-schemas';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import {
  sendOfficeEmailVerification,
  verifyOfficeEmail,
} from '@/features/office/services/office-client';
import { cn } from '@/lib/utils/cn';
import { EmailSendCooldownBar } from '@/components/auth/EmailSendCooldownBar';
import { useEmailSendCooldown } from '@/hooks/use-email-send-cooldown';

const fieldClassName =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15';

interface OfficeEmailVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  excludeOfficeId?: string;
  onVerified: (email: string) => void;
}

export function OfficeEmailVerificationModal({
  open,
  onOpenChange,
  email,
  excludeOfficeId,
  onVerified,
}: OfficeEmailVerificationModalProps) {
  const { t } = useLocale();
  const verifySchema = useMemo(() => createVerifyEmailSchema(t), [t]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const { remainingSeconds, totalSeconds, canSend, startCooldown } = useEmailSendCooldown(email);

  const handleResend = async () => {
    if (!canSend) return;

    setError('');
    setResending(true);
    try {
      await sendOfficeEmailVerification(email, excludeOfficeId);
      startCooldown();
      toast.success(t('auth.verificationCodeSent'));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    setError('');

    const parsed = verifySchema.safeParse({ email, code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t('validation.code6Digits'));
      return;
    }

    setSubmitting(true);
    try {
      await verifyOfficeEmail(email, code, excludeOfficeId);
      toast.success(t('dashboard.office.emailVerified'));
      onVerified(email);
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-var(--shadow-float)"
      >
        <h2 className="text-lg font-bold text-primary-dark">{t('auth.verifyEmailTitle')}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t('dashboard.office.verifyEmailDescription').replace('{email}', email)}
        </p>

        <div className="mt-5 space-y-4">
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="office_verification_code" className="text-sm font-medium text-primary-dark">
              {t('auth.verificationCode')}
            </label>
            <input
              id="office_verification_code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleVerify();
                }
              }}
              className={cn(fieldClassName, 'tracking-[0.3em] text-center font-mono text-lg')}
            />
          </div>

          <EmailSendCooldownBar remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t('admin.cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!canSend || resending}
              onClick={() => void handleResend()}
            >
              {resending ? t('auth.sending') : t('auth.resendCode')}
            </Button>
            <Button type="button" disabled={submitting} onClick={() => void handleVerify()}>
              {submitting ? t('auth.verifying') : t('auth.verifyEmail')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
