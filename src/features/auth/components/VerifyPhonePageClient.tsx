'use client';

import { useSearchParams } from 'next/navigation';
import { VerifyPhonePanel } from '@/features/auth/components/VerifyPhonePanel';
import { getSafeRedirectPath, getSafeWhatsAppLink } from '@/lib/auth/safe-redirect';
import { useLocale } from '@/lib/i18n/locale-provider';

function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function VerifyPhonePageClient() {
  const searchParams = useSearchParams();
  const { t } = useLocale();

  const sessionId = searchParams.get('sessionId') ?? '';
  const whatsAppLink = getSafeWhatsAppLink(decodeParam(searchParams.get('link') ?? ''));
  const redirect = getSafeRedirectPath(searchParams.get('redirect')) ?? undefined;
  const label = searchParams.get('label') ?? 'العودة إلى التسجيل';
  const backUrl = getSafeRedirectPath(searchParams.get('backUrl')) ?? '/login';

  if (!sessionId || !whatsAppLink) {
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
        whatsAppLink={whatsAppLink}
        redirectAfterVerify={redirect}
        label={label}
        backUrl={backUrl}
      />
    </div>
  );
}
