'use client';

import { useId, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

export function OfficeEmailVerifyHint({ className }: { className?: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const hintId = useId();

  return (
    <span className={cn('relative inline-flex', className)}>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        aria-expanded={open}
        aria-controls={hintId}
        aria-label={t('dashboard.office.verifyEmailWhyTitle')}
        title={t('dashboard.office.verifyEmailWhyBody')}
        onClick={() => setOpen((value) => !value)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOpen(false);
          }
        }}
      >
        <CircleAlert className="h-4 w-4" />
      </button>
      <span
        id={hintId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute top-full z-20 mt-2 w-64 rounded-xl border border-amber-200/80 bg-white p-3 text-start text-xs leading-relaxed text-gray-600 shadow-lg',
          'end-0 sm:w-72',
          open ? 'block' : 'hidden',
        )}
      >
        <p className="font-semibold text-primary-dark">{t('dashboard.office.verifyEmailWhyTitle')}</p>
        <p className="mt-1">{t('dashboard.office.verifyEmailWhyBody')}</p>
      </span>
    </span>
  );
}
