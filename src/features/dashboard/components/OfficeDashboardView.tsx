import Link from 'next/link';
import {
  Building2,
  Home,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Plus,
  Users,
} from 'lucide-react';
import { AuthUser } from '@/features/auth/types/user';
import { DashboardConversationPreview } from '@/features/dashboard/components/DashboardConversationPreview';
import {
  DashboardMetricCard,
  DashboardQuickLinks,
  type DashboardQuickLinkItem,
} from '@/features/dashboard/components/DashboardQuickLinks';
import { VerificationStatusBanner } from '@/features/dashboard/components/VerificationStatusBanner';
import type { DashboardOfficeContext } from '@/features/dashboard/types/dashboard-home';
import type { TranslationKey } from '@/lib/i18n/ar';
import { getServerTranslations } from '@/lib/i18n/server';
import { ButtonLink } from '@/components/ui/button';

interface OfficeDashboardViewProps {
  user: AuthUser;
  context: DashboardOfficeContext;
}

export async function OfficeDashboardView({ user, context }: OfficeDashboardViewProps) {
  const { t } = await getServerTranslations();
  const { offices, snapshot } = context;
  const primaryOffice = offices[0] ?? null;

  if (!primaryOffice || !snapshot) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-primary-dark">
            {t('dashboard.welcome', { name: user.f_name })}
          </h1>
          <p className="mt-2 text-gray-500">{t('dashboard.home.officeHint')}</p>
        </header>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-var(--shadow-soft)">
          <Building2 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">{t('dashboard.office.noOffice')}</p>
          <ButtonLink href="/dashboard/office" className="mt-6">
            {t('dashboard.home.createOfficeCta')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const publishedLabel =
    snapshot.publishedHasMore && snapshot.publishedCount > 0
      ? `${snapshot.publishedCount}+`
      : String(snapshot.publishedCount);

  const quickLinks: DashboardQuickLinkItem[] = [
    {
      href: '/dashboard/office/listings/new',
      label: t('dashboard.home.newListing'),
      description: t('dashboard.home.newListingHint'),
      icon: Plus,
    },
    {
      href: '/dashboard/office/listings',
      label: t('dashboard.officeListings'),
      description: t('dashboard.home.manageOfficeListingsHint'),
      icon: Home,
    },
    {
      href: '/dashboard/office/analytics',
      label: t('dashboard.office.analyticsNav'),
      description: t('dashboard.office.analyticsHint'),
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/office/users',
      label: t('dashboard.office.userAnalyticsNav'),
      description: t('dashboard.office.userAnalyticsHint'),
      icon: Users,
    },
    {
      href: '/dashboard/messages',
      label: t('dashboard.messages'),
      description: t('dashboard.messages.hint'),
      icon: MessageCircle,
      badge: snapshot.unreadMessages,
    },
    {
      href: '/dashboard/support-tickets',
      label: t('dashboard.supportTickets'),
      description: t('dashboard.home.supportTicketsHint'),
      icon: LifeBuoy,
      badge: snapshot.openSupportTickets,
    },
    {
      href: '/dashboard/office',
      label: t('dashboard.office'),
      description: t('dashboard.home.officeSettingsHint'),
      icon: Building2,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-var(--shadow-soft) sm:p-8">
        <p className="text-sm font-medium text-brand-dark">{primaryOffice.name}</p>
        <h1 className="mt-1 text-2xl font-bold text-primary-dark sm:text-3xl">
          {t('dashboard.welcome', { name: user.f_name })}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">{t('dashboard.home.officeHint')}</p>
      </header>

      <VerificationStatusBanner
        office_name={primaryOffice.name}
        status={primaryOffice.verification_status}
        reason={primaryOffice.rejected_reason}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          label={t('dashboard.home.teamMembers')}
          value={snapshot.teamCount}
          hint={t('dashboard.officeUsers')}
        />
        <DashboardMetricCard
          label={t('dashboard.listings.status.published')}
          value={publishedLabel}
          hint={t('dashboard.home.publishedListingsHint')}
        />
        <DashboardMetricCard
          label={t('dashboard.listings.status.sold')}
          value={snapshot.soldThisMonth}
          hint={t('dashboard.home.thisMonth')}
        />
        <DashboardMetricCard
          label={t('dashboard.listings.status.rented')}
          value={snapshot.rentedThisMonth}
          hint={t('dashboard.home.thisMonth')}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <DashboardConversationPreview conversations={snapshot.conversations} />
        </div>

        <div className="space-y-6 xl:col-span-2">
          {snapshot.unreadNotifications > 0 ? (
            <div className="rounded-2xl border border-brand/20 bg-brand-muted/40 px-5 py-4">
              <p className="text-sm font-semibold text-brand-dark">{t('dashboard.home.unreadNotifications')}</p>
              <p className="mt-1 text-2xl font-bold text-primary-dark">{snapshot.unreadNotifications}</p>
              <Link
                href="/dashboard/notifications"
                className="mt-2 inline-block text-xs font-semibold text-brand-dark hover:text-brand"
              >
                {t('dashboard.notifications')}
              </Link>
            </div>
          ) : null}

          {snapshot.topListings.length > 0 ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-var(--shadow-soft)">
              <h2 className="text-sm font-semibold text-primary-dark">{t('dashboard.office.topListings')}</h2>
              <p className="mt-1 text-xs text-gray-500">{t('dashboard.home.thisMonth')}</p>
              <ul className="mt-4 space-y-3">
                {snapshot.topListings.map((listing) => (
                  <li key={listing.listing_id}>
                    <Link
                      href={`/listings/${listing.slug}`}
                      className="block rounded-xl border border-gray-100 px-3 py-2.5 transition-colors hover:border-brand/20 hover:bg-gray-50"
                    >
                      <p className="truncate text-sm font-medium text-primary-dark">{listing.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {t(`dashboard.listings.status.${listing.action}` as TranslationKey)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/office/analytics"
                className="mt-4 inline-block text-xs font-semibold text-brand-dark hover:text-brand"
              >
                {t('dashboard.office.analyticsNav')}
              </Link>
            </section>
          ) : null}
        </div>
      </div>

      <DashboardQuickLinks title={t('dashboard.home.quickLinks')} items={quickLinks} />
    </div>
  );
}
