'use client';

import Link from 'next/link';
import {
  ArrowLeftRight,
  Bookmark,
  Building2,
  Clock,
  Eye,
  Home,
  Landmark,
  Layers,
  LayoutDashboard,
  ListTree,
  MapPin,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AdminDashboardAnalytics } from '@/features/admin/services/admin-dashboard-service';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface AdminDashboardProps {
  initial: AdminDashboardAnalytics | null;
  adminName: string;
}

const QUICK_LINKS = [
  {
    href: '/admin/offices/pending',
    labelKey: 'admin.pendingOffices' as const,
    hintKey: 'admin.dashboardPendingOfficesHint' as const,
    icon: Clock,
    tone: 'warning' as const,
    badge: (data: AdminDashboardAnalytics) => data.summary.pending_offices,
  },
  {
    href: '/admin/individual-listers/pending',
    labelKey: 'admin.pendingIndividualListers' as const,
    hintKey: 'admin.dashboardPendingListersHint' as const,
    icon: Sparkles,
    tone: 'warning' as const,
    badge: (data: AdminDashboardAnalytics) => data.summary.pending_individual_listers,
  },
  {
    href: '/admin/users',
    labelKey: 'admin.users' as const,
    hintKey: 'admin.manageUsersHint' as const,
    icon: Users,
    tone: 'brand' as const,
    badge: (data: AdminDashboardAnalytics) => data.summary.total_users,
  },
  {
    href: '/admin/offices',
    labelKey: 'admin.offices' as const,
    hintKey: 'admin.dashboardOfficesHint' as const,
    icon: Building2,
    tone: 'brand' as const,
    badge: (data: AdminDashboardAnalytics) => data.summary.total_offices,
  },
  {
    href: '/admin/listings',
    labelKey: 'admin.listings' as const,
    hintKey: 'admin.dashboardListingsHint' as const,
    icon: Home,
    tone: 'brand' as const,
    badge: (data: AdminDashboardAnalytics) => data.summary.total_listings,
  },
  {
    href: '/admin/individual-listers',
    labelKey: 'admin.individualListers' as const,
    hintKey: 'admin.dashboardIndividualListersHint' as const,
    icon: Sparkles,
    tone: 'brand' as const,
    badge: (data: AdminDashboardAnalytics) => data.summary.total_individual_listers,
  },
  {
    href: '/admin/cities',
    labelKey: 'admin.cities' as const,
    hintKey: 'admin.manageCitiesHint' as const,
    icon: Landmark,
    tone: 'neutral' as const,
  },
  {
    href: '/admin/property-types',
    labelKey: 'admin.propertyTypes' as const,
    hintKey: 'admin.managePropertyTypesHint' as const,
    icon: Layers,
    tone: 'neutral' as const,
  },
  {
    href: '/admin/transaction-types',
    labelKey: 'admin.transactionTypes' as const,
    hintKey: 'admin.manageTransactionTypesHint' as const,
    icon: ArrowLeftRight,
    tone: 'neutral' as const,
  },
  {
    href: '/admin/neighborhoods',
    labelKey: 'admin.neighborhoods' as const,
    hintKey: 'admin.manageNeighborhoodsHint' as const,
    icon: MapPin,
    tone: 'neutral' as const,
  },
  {
    href: '/admin/features',
    labelKey: 'admin.mainFeatures' as const,
    hintKey: 'admin.manageMainFeaturesHint' as const,
    icon: Sparkles,
    tone: 'neutral' as const,
  },
  {
    href: '/admin/sub-features',
    labelKey: 'admin.subFeatures' as const,
    hintKey: 'admin.manageSubFeaturesHint' as const,
    icon: ListTree,
    tone: 'neutral' as const,
  },
] as const;

function toneClasses(tone: 'brand' | 'warning' | 'neutral') {
  switch (tone) {
    case 'warning':
      return 'bg-amber-50 text-amber-700 ring-amber-200/80';
    case 'brand':
      return 'bg-brand-muted text-brand-dark ring-brand/20';
    default:
      return 'bg-gray-100 text-gray-600 ring-gray-200/80';
  }
}

function StatCard({
  label,
  value,
  sub,
  icon,
  href,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-[var(--shadow-soft)] transition-all',
        highlight
          ? 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-white'
          : 'border-gray-200 hover:border-brand/30 hover:shadow-[var(--shadow-float)]',
        href && 'group',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-primary-dark">{value}</p>
          {sub ? <p className="mt-1 text-xs text-gray-400">{sub}</p> : null}
        </div>
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1',
            highlight ? 'bg-amber-100 text-amber-700 ring-amber-200/80' : 'bg-brand-muted text-brand ring-brand/20',
          )}
        >
          {icon}
        </span>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-primary-dark">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-gray-400">{message}</p>;
}

export function AdminDashboard({ initial, adminName }: AdminDashboardProps) {
  const { t } = useLocale();
  const data = initial;

  if (!data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
        {t('admin.dashboardLoadError')}
      </div>
    );
  }

  const { summary } = data;
  const maxCityCount = Math.max(...data.listings_by_city.map((city) => city.listing_count), 1);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-[var(--shadow-soft)]">
            <LayoutDashboard className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-primary-dark">{t('admin.welcome').replace('{name}', adminName)}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('admin.dashboardSubtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('admin.pendingOffices')}
          value={String(summary.pending_offices)}
          sub={t('admin.dashboardNeedsReview')}
          icon={<Clock className="h-5 w-5" />}
          href="/admin/offices/pending"
          highlight={summary.pending_offices > 0}
        />
        <StatCard
          label={t('admin.pendingIndividualListers')}
          value={String(summary.pending_individual_listers)}
          sub={t('admin.dashboardNeedsReview')}
          icon={<Sparkles className="h-5 w-5" />}
          href="/admin/individual-listers/pending"
          highlight={summary.pending_individual_listers > 0}
        />
        <StatCard
          label={t('admin.dashboardPublishedListings')}
          value={String(summary.published_listings)}
          sub={t('admin.dashboardTotalListingsSub').replace('{count}', String(summary.total_listings))}
          icon={<Home className="h-5 w-5" />}
          href="/admin/listings"
        />
        <StatCard
          label={t('admin.users')}
          value={String(summary.total_users)}
          sub={t('admin.dashboardVerifiedOfficesSub').replace('{count}', String(summary.verified_offices))}
          icon={<Users className="h-5 w-5" />}
          href="/admin/users"
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-primary-dark">{t('admin.dashboardQuickLinks')}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {QUICK_LINKS.map((link) => {
            const badge = 'badge' in link && link.badge ? link.badge(data) : null;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-soft)] transition-all hover:border-brand/30 hover:shadow-[var(--shadow-float)]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
                      toneClasses(link.tone),
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-primary-dark group-hover:text-brand-dark">
                        {t(link.labelKey)}
                      </p>
                      {badge !== null && badge > 0 ? (
                        <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{t(link.hintKey)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title={t('admin.dashboardListingsByCity')}>
          {data.listings_by_city.length === 0 ? (
            <EmptyState message={t('admin.noDataYet')} />
          ) : (
            <ul className="space-y-4">
              {data.listings_by_city.map((city) => (
                <li key={city.city_id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-primary-dark">{city.city_name}</span>
                    <span className="shrink-0 text-gray-500">
                      {t('admin.dashboardListingCount').replace('{count}', String(city.listing_count))}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${Math.max((city.listing_count / maxCityCount) * 100, 6)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title={t('admin.dashboardTopOffices')}
          action={
            <Link href="/admin/offices" className="text-sm font-medium text-brand hover:text-brand-dark">
              {t('admin.viewAll')} →
            </Link>
          }
        >
          {data.top_offices.length === 0 ? (
            <EmptyState message={t('admin.noDataYet')} />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.top_offices.map((office, index) => (
                <li key={office.office_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-xs font-bold text-brand-dark">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/offices/${office.office_id}`}
                      className="block truncate font-medium text-primary-dark hover:text-brand-dark"
                    >
                      {office.office_name}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {t('admin.dashboardOfficeStats').replace('{listings}', String(office.listing_count)).replace('{views}', String(office.view_count)).replace('{saves}', String(office.save_count))}
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 shrink-0 text-brand" />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title={t('admin.dashboardTopViewedListings')}
          action={
            <Link href="/admin/listings" className="text-sm font-medium text-brand hover:text-brand-dark">
              {t('admin.viewAll')} →
            </Link>
          }
        >
          {data.top_viewed_listings.length === 0 ? (
            <EmptyState message={t('admin.noDataYet')} />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.top_viewed_listings.map((listing) => (
                <li key={listing.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <Eye className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="line-clamp-2 font-medium text-primary-dark hover:text-brand-dark"
                    >
                      {listing.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {listing.city_name} · {t('admin.dashboardViewsCount').replace('{count}', String(listing.view_count ?? 0))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title={t('admin.dashboardTopSavedListings')}
          action={
            <Link href="/admin/listings" className="text-sm font-medium text-brand hover:text-brand-dark">
              {t('admin.viewAll')} →
            </Link>
          }
        >
          {data.top_saved_listings.length === 0 ? (
            <EmptyState message={t('admin.noDataYet')} />
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.top_saved_listings.map((listing) => (
                <li key={listing.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand-dark">
                    <Bookmark className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="line-clamp-2 font-medium text-primary-dark hover:text-brand-dark"
                    >
                      {listing.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {listing.city_name} · {t('admin.dashboardSavesCount').replace('{count}', String(listing.save_count ?? 0))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
