import { getServerTranslations } from '@/lib/i18n/server';
import type { TranslationKey } from '@/lib/i18n/ar';

type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

interface VerificationStatusBannerProps {
  office_name?: string;
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

function formatMessage(message: string, officeName?: string): string {
  if (!officeName) return message;
  return message.replaceAll('{officeName}', officeName);
}

export async function VerificationStatusBanner({ office_name, status, reason }: VerificationStatusBannerProps) {
  if (status === 'verified') return null;

  const { t } = await getServerTranslations();

  const messageKey =
    status === 'pending' && office_name
      ? 'dashboard.verification.pendingMessageOffice'
      : MESSAGE_KEYS[status];

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">{formatMessage(t(messageKey), office_name)}</p>
      {reason && (status === 'rejected' || status === 'suspended') ? (
        <p className="mt-1">
          {t(REASON_KEYS[status])}: {reason} {office_name ? `(${office_name})` : ''}
        </p>
      ) : null}
    </div>
  );
}
