'use client';

import { useLocale } from '@/lib/i18n/locale-provider';
import { formatEmailSendCooldown } from '@/lib/auth/email-send-cooldown';

interface EmailSendCooldownBarProps {
  remainingSeconds: number;
  totalSeconds: number;
  className?: string;
}

export function EmailSendCooldownBar({
  remainingSeconds,
  totalSeconds,
  className,
}: EmailSendCooldownBarProps) {
  const { t } = useLocale();

  if (remainingSeconds <= 0 || totalSeconds <= 0) return null;

  const widthPercent = (remainingSeconds / totalSeconds) * 100;

  return (
    <div className={className ?? 'space-y-1.5'}>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalSeconds}
        aria-valuenow={remainingSeconds}
        aria-label={t('auth.resendCodeTimer').replace(
          '{time}',
          formatEmailSendCooldown(remainingSeconds),
        )}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-1000 ease-linear"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {t('auth.resendCodeTimer').replace('{time}', formatEmailSendCooldown(remainingSeconds))}
      </p>
    </div>
  );
}
