'use client';

import { VerifyPhonePanel } from '@/features/auth/components/VerifyPhonePanel';
import { useLocale } from '@/lib/i18n/locale-provider';

export interface VerifyPhoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  whatsAppLink: string;
  onVerified: (phoneDigitKey: string | null) => void;
}

export function VerifyPhoneModal({
  open,
  onOpenChange,
  sessionId,
  whatsAppLink,
  onVerified,
}: VerifyPhoneModalProps) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]"
      >
        <h2 className="text-lg font-bold text-primary-dark">{t('auth.verifyPhoneTitle')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('auth.verifyPhoneSubtitle')}</p>

        <div className="mt-5">
          <VerifyPhonePanel
            sessionId={sessionId}
            whatsAppLink={whatsAppLink}
            onCancel={() => onOpenChange(false)}
            onVerified={(digitKey) => {
              onVerified(digitKey);
              onOpenChange(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
