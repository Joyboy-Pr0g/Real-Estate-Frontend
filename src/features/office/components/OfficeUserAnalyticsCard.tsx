'use client';

import { OfficeUserAnalyticsEntry } from '@/features/office/types/office';
import { useLocale } from '@/lib/i18n/locale-provider';

interface OfficeUserAnalyticsCardProps {
  user: OfficeUserAnalyticsEntry;
  rank: number;
}

export function OfficeUserAnalyticsCard({ user, rank }: OfficeUserAnalyticsCardProps) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-var(--shadow-soft)">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-bold text-brand-dark">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-primary-dark">
            {user.f_name} {user.l_name}
          </h3>
          <p className="truncate text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs font-medium text-gray-500">{t('dashboard.listings.status.sold')}</p>
          <p className="mt-1 text-lg font-semibold text-primary-dark">{user.sold_count}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">{t('dashboard.listings.status.rented')}</p>
          <p className="mt-1 text-lg font-semibold text-primary-dark">{user.rented_count}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">{t('dashboard.office.userAnalyticsTotal')}</p>
          <p className="mt-1 text-lg font-semibold text-brand-dark">{user.total_count}</p>
        </div>
      </div>
    </article>
  );
}
