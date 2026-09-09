import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DashboardQuickLinkItem {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardQuickLinksProps {
  title: string;
  items: DashboardQuickLinkItem[];
  className?: string;
}

export function DashboardQuickLinks({ title, items, className }: DashboardQuickLinksProps) {
  return (
    <section className={className}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-var(--shadow-soft) transition-all hover:border-brand/25 hover:shadow-var(--shadow-float)"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand-dark transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="h-5 w-5" strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-primary-dark">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{item.description}</span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function DashboardMetricCard({ label, value, hint, className }: DashboardMetricCardProps) {
  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white p-5 shadow-var(--shadow-soft)', className)}>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary-dark">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
