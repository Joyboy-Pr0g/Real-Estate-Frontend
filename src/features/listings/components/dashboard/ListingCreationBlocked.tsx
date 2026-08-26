import Link from 'next/link';
import { getServerTranslations } from '@/lib/i18n/server';
import type { TranslationKey } from '@/lib/i18n/ar';

type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

interface ListingCreationBlockedProps {
  status: VerificationStatus;
  reason?: string | null;
  backHref: string;
}

const MESSAGE_KEYS: Record<Exclude<VerificationStatus, 'verified'>, TranslationKey> = {
  pending: 'dashboard.listings.createBlockedPending',
  rejected: 'dashboard.listings.createBlockedRejected',
  suspended: 'dashboard.listings.createBlockedSuspended',
};

export async function ListingCreationBlocked({ status, reason, backHref }: ListingCreationBlockedProps) {
  const { t } = await getServerTranslations();
  const messageKey =
    status === 'verified' ? 'dashboard.listings.createBlockedPending' : MESSAGE_KEYS[status];

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
      <p className="text-sm font-semibold text-amber-900">{t(messageKey)}</p>
      {reason && (status === 'rejected' || status === 'suspended') ? (
        <p className="mt-2 text-sm text-amber-800">
          {t(status === 'suspended' ? 'dashboard.suspendedReason' : 'dashboard.rejectedReason')}: {reason}
        </p>
      ) : null}
      <Link href={backHref} className="mt-4 inline-block text-sm font-medium text-brand-dark hover:underline">
        {t('dashboard.listings.backToListings')}
      </Link>
    </div>
  );
}
