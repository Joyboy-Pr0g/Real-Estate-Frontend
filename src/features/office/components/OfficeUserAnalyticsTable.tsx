'use client';

import { OfficeUserAnalyticsEntry } from '@/features/office/types/office';
import { useLocale } from '@/lib/i18n/locale-provider';

interface OfficeUserAnalyticsTableProps {
  users: OfficeUserAnalyticsEntry[];
}

export function OfficeUserAnalyticsTable({ users }: OfficeUserAnalyticsTableProps) {
  const { t } = useLocale();

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-var(--shadow-soft) lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-start">
              <th className="px-5 py-4 font-semibold text-gray-600">
                {t('dashboard.office.userAnalyticsMember')}
              </th>
              <th className="px-5 py-4 font-semibold text-gray-600">
                {t('dashboard.listings.status.sold')}
              </th>
              <th className="px-5 py-4 font-semibold text-gray-600">
                {t('dashboard.listings.status.rented')}
              </th>
              <th className="px-5 py-4 font-semibold text-gray-600">
                {t('dashboard.office.userAnalyticsTotal')}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.user_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-bold text-brand-dark">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-primary-dark">
                        {user.f_name} {user.l_name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-center text-primary-dark">{user.sold_count}</td>
                <td className="px-5 py-4 font-medium text-center text-primary-dark">{user.rented_count}</td>
                <td className="px-5 py-4 font-semibold text-center text-brand-dark">{user.total_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
