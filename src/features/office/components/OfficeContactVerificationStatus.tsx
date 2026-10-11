'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

function isContactVerified(value: string | null | undefined): boolean {
  return value != null && value !== '';
}

interface OfficeContactVerificationStatusProps {
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  className?: string;
  layout?: 'row' | 'stack';
}

export function OfficeContactVerificationStatus({
  emailVerifiedAt,
  phoneVerifiedAt,
  className,
  layout = 'row',
}: OfficeContactVerificationStatusProps) {
  const { t } = useLocale();
  const emailOk = isContactVerified(emailVerifiedAt);
  const phoneOk = isContactVerified(phoneVerifiedAt);

  const items = [
    {
      key: 'email',
      ok: emailOk,
      label: emailOk ? t('dashboard.office.contactEmailVerified') : t('dashboard.office.contactEmailNotVerified'),
    },
    {
      key: 'phone',
      ok: phoneOk,
      label: phoneOk ? t('dashboard.office.contactPhoneVerified') : t('dashboard.office.contactPhoneNotVerified'),
    },
  ] as const;

  return (
    <ul
      className={cn(
        'flex flex-wrap gap-2',
        layout === 'stack' && 'flex-col gap-1.5',
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.key}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
            item.ok
              ? 'bg-emerald-50 text-emerald-800 ring-emerald-200/80'
              : 'bg-amber-50 text-amber-900 ring-amber-200/80',
          )}
        >
          {item.ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
          {item.label}
        </li>
      ))}
    </ul>
  );
}
