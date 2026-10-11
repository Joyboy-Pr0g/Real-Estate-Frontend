'use client';

import { useSearchParams } from 'next/navigation';
import { VerifyPhonePanel } from '@/features/auth/components/VerifyPhonePanel';
import { useLocale } from '@/lib/i18n/locale-provider';

export function VerifyPhonePageClient() {
  const searchParams = useSearchParams();
  const { t } = useLocale();

  const sessionId = searchParams.get('sessionId') ?? '';
  const link = searchParams.get('link') ?? '';
  const redirect = searchParams.get('redirect') ?? undefined;
  const label = searchParams.get('label') ?? 'العودة إلى التسجيل';
  const backUrl = searchParams.get('backUrl') ?? '/login';

  if (!sessionId || !link) {
    return (
      <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t('auth.verifyPhoneMissingParams')}
      </p>
    );
  }

  return (
    <div className="mt-6">
      <VerifyPhonePanel
        sessionId={sessionId}
        whatsAppLink={decodeURIComponent(link)}
        redirectAfterVerify={redirect}
        label={label}
        backUrl={backUrl}
      />
    </div>
  );
}
