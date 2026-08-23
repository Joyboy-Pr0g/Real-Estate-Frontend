import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { MyOffice } from '@/features/office/types/office';
import { getServerTranslations } from '@/lib/i18n/server';
import type { TranslationKey } from '@/lib/i18n/ar';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  verified: 'bg-brand-muted text-brand-dark ring-1 ring-brand/15',
  rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  suspended: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
};

interface OfficesListViewProps {
  offices: MyOffice[];
  hrefSuffix?: string;
}

export async function OfficesListView({ offices, hrefSuffix = '' }: OfficesListViewProps) {
  const { t } = await getServerTranslations();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {offices.map((office) => (
        <Link
          key={office.id}
          href={`/dashboard/office/${office.id}${hrefSuffix}`}
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-brand/30"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-primary-dark">{office.name}</p>
            <p className="truncate text-xs text-gray-500">
              {office.city.name}, {office.neighborhood.name}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[office.verification_status]}`}
          >
            {t(`dashboard.verification.${office.verification_status}` as TranslationKey)}
          </span>
        </Link>
      ))}
    </div>
  );
}
