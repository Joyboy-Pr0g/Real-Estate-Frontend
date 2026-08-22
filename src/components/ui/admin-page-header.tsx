'use client';

import Link from 'next/link';
import { ChevronLeft, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';
import { cn } from '@/lib/utils/cn';

export interface AdminBreadcrumbItem {
  labelKey: TranslationKey;
  href?: string;
  icon?: LucideIcon;
}

interface AdminPageHeaderProps {
  breadcrumbItems: AdminBreadcrumbItem[];
  title: string;
  countLabel: string;
  filters?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  breadcrumbItems,
  title,
  countLabel,
  filters,
  className,
}: AdminPageHeaderProps) {
  const { t, dir } = useLocale();

  return (
    <header className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">{title}</h1>
          <span className="text-sm text-gray-500" aria-label={countLabel}>
            <span className="mx-1 hidden text-gray-300 sm:inline" aria-hidden>
              ·
            </span>
            {countLabel}
          </span>
        </div>

        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
          {breadcrumbItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <span key={item.labelKey} className="inline-flex items-center gap-1">
                {index > 0 ? <ChevronLeft className={cn('h-3.5 w-3.5 opacity-40', dir === 'ltr' && 'rotate-180')} /> : null}
                {item.href && !isLast ? (
                  <Link href={item.href} className="inline-flex items-center gap-1 hover:text-brand">
                    {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                    {t(item.labelKey)}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-primary-dark">
                    {Icon ? <Icon className="h-3.5 w-3.5 text-brand" /> : null}
                    {t(item.labelKey)}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      {filters ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
          {filters}
        </div>
      ) : null}
    </header>
  );
}
