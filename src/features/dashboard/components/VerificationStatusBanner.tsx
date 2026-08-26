import { getServerTranslations } from '@/lib/i18n/server';
import type { TranslationKey } from '@/lib/i18n/ar';

type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

interface VerificationStatusBannerProps {
  status: VerificationStatus;
  reason?: string | null;
}

const MESSAGE_KEYS: Record<Exclude<VerificationStatus, 'verified'>, TranslationKey> = {
  pending: 'dashboard.verification.pendingMessage',
  rejected: 'dashboard.verification.rejectedMessage',
  suspended: 'dashboard.verification.suspendedMessage',
};

const REASON_KEYS: Record<'rejected' | 'suspended', TranslationKey> = {
  rejected: 'dashboard.rejectedReason',
  suspended: 'dashboard.suspendedReason',
};

export async function VerificationStatusBanner({ status, reason }: VerificationStatusBannerProps) {
  if (status === 'verified') return null;

  const { t } = await getServerTranslations();

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">{t(MESSAGE_KEYS[status])}</p>
      {reason && (status === 'rejected' || status === 'suspended') ? (
        <p className="mt-1">
          {t(REASON_KEYS[status])}: {reason}
        </p>
      ) : null}
    </div>
  );
}
