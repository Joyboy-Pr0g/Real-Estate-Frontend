'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VerifyPhoneModal } from '@/features/auth/components/VerifyPhoneModal';
import { Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestVerification } from '@/features/auth/services/auth-service';
import { markEmailCodeSent } from '@/lib/auth/email-send-cooldown';
import { getSafeRedirectPath } from '@/lib/auth/safe-redirect';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface LoginVerificationChoiceModalProps {
  open: boolean;
  email: string;
  password: string;
  onClose: () => void;
}

export function LoginVerificationChoiceModal({
  open,
  email,
  password,
  onClose,
}: LoginVerificationChoiceModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [loading, setLoading] = useState<'email' | 'phone' | null>(null);
  const [error, setError] = useState('');
  const [phoneVerifySession, setPhoneVerifySession] = useState<{ sessionId: string; link: string } | null>(
    null,
  );

  if (!open && !phoneVerifySession) return null;

  const handleEmail = async () => {
    setError('');
    setLoading('email');
    try {
      await requestVerification({ email, password, channel: 'email' });
      markEmailCodeSent(email);
      const params = new URLSearchParams({ email, sent: '1' });
      const redirect = getSafeRedirectPath(searchParams.get('redirect'));
      if (redirect) params.set('redirect', redirect);
      router.push(`/verify-email?${params.toString()}`);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  const handlePhone = async () => {
    setError('');
    setLoading('phone');
    try {
      const result = await requestVerification({ email, password, channel: 'phone' });
      if (!result?.sessionId || !result.link) {
        setError(t('auth.verifyPhoneStartFailed'));
        return;
      }
      setPhoneVerifySession({ sessionId: result.sessionId, link: result.link });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  const loginRedirect = () => {
    const redirect = getSafeRedirectPath(searchParams.get('redirect'));
    if (redirect) {
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    } else {
      router.push('/login');
    }
    router.refresh();
  };

  return (
    <>
    {phoneVerifySession ? (
      <VerifyPhoneModal
        open={Boolean(phoneVerifySession)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPhoneVerifySession(null);
        }}
        sessionId={phoneVerifySession.sessionId}
        whatsAppLink={phoneVerifySession.link}
        onVerified={() => {
          loginRedirect();
        }}
      />
    ) : null}

    {open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-primary-dark">{t('auth.verifyAccountTitle')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('auth.verifyAccountDescription')}</p>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 justify-start gap-3 rounded-xl"
            disabled={loading !== null}
            onClick={() => void handleEmail()}
          >
            <Mail className="h-5 w-5 shrink-0 text-brand" />
            {loading === 'email' ? t('auth.sending') : t('auth.verifyByEmail')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 justify-start gap-3 rounded-xl"
            disabled={loading !== null}
            onClick={() => void handlePhone()}
          >
            <MessageCircle className="h-5 w-5 shrink-0 text-brand" />
            {loading === 'phone' ? t('auth.sending') : t('auth.verifyByPhone')}
          </Button>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading !== null}>
            {t('admin.cancel')}
          </Button>
        </div>
      </div>
    </div>
    ) : null}
    </>
  );
}
