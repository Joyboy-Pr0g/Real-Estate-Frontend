'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ListingContentTabsProps {
  details: ReactNode;
  location: ReactNode;
  history?: ReactNode;
  metrics?: ReactNode;
}

type TabKey = 'details' | 'location' | 'history' | 'metrics';

export function ListingContentTabs({ details, location, history, metrics }: ListingContentTabsProps) {
  const { t } = useLocale();
  const [active, setActive] = useState<TabKey>('details');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'details', label: t('detail.tabs.details') },
    { key: 'location', label: t('detail.tabs.location') },
    ...(history ? [{ key: 'history' as const, label: t('detail.tabs.history') }] : []),
    ...(metrics ? [{ key: 'metrics' as const, label: t('detail.tabs.metrics') }] : []),
  ];

  return (
    <div className="rounded-2xl bg-white shadow-(--shadow-soft) ring-1 ring-gray-100">
      <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-4 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              'relative shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors',
              active === tab.key ? 'text-brand-dark' : 'text-gray-500 hover:text-primary-dark',
            )}
          >
            {tab.label}
            {active === tab.key ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="p-5">
        {active === 'details' ? details : null}
        {active === 'location' ? location : null}
        {active === 'history' && history ? history : null}
        {active === 'metrics' && metrics ? metrics : null}
      </div>
    </div>
  );
}
