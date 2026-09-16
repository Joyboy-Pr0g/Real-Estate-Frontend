import { HandCoins, KeyRound } from 'lucide-react';
import { ListingHistoryEntry } from '@/features/listings/types/listing-detail';
import { YerVariant } from '@/features/listings/types/listing';
import { formatPriceYER } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/format';
import { getServerTranslations } from '@/lib/i18n/server';
import { cn } from '@/lib/utils/cn';

interface ListingHistoryTabProps {
  histories: ListingHistoryEntry[];
  yerVariant?: YerVariant;
}

const ACTION_STYLES = {
  sold: {
    icon: HandCoins,
    dot: 'bg-blue-500 ring-blue-100',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  rented: {
    icon: KeyRound,
    dot: 'bg-amber-500 ring-amber-100',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
} as const;

export async function ListingHistoryTab({ histories, yerVariant }: ListingHistoryTabProps) {
  const { t } = await getServerTranslations();

  const sorted = [...histories].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );

  return (
    <div className="space-y-1">
      <h3 className="mb-5 text-base font-bold text-primary-dark">{t('detail.history.title')}</h3>

      <ol className="relative space-y-0">
        {sorted.map((entry, index) => {
          const styles = ACTION_STYLES[entry.action];
          const Icon = styles.icon;
          const isLast = index === sorted.length - 1;

          return (
            <li key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute start-[11px] top-6 bottom-0 w-px bg-gray-200"
                />
              ) : null}

              <span
                className={cn(
                  'relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4',
                  styles.dot,
                )}
              >
                <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />
              </span>

              <div className="min-w-0 flex-1 space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
                      styles.badge,
                    )}
                  >
                    {entry.action === 'sold' ? t('detail.history.sold') : t('detail.history.rented')}
                  </span>
                  <span className="text-lg font-bold text-brand-dark">
                    {formatPriceYER(entry.price, yerVariant)}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="text-gray-400">{t('detail.history.startedAt')}: </span>
                    <time dateTime={entry.started_at}>{formatDateTime(entry.started_at)}</time>
                  </p>
                  {entry.ended_at ? (
                    <p>
                      <span className="text-gray-400">{t('detail.history.endedAt')}: </span>
                      <time dateTime={entry.ended_at}>{formatDateTime(entry.ended_at)}</time>
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
