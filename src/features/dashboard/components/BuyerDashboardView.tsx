import {
  Bookmark,
  Heart,
  History,
  Home,
  Map,
  MessageCircle,
  Sparkles,
  User,
} from 'lucide-react';
import { AuthUser } from '@/features/auth/types/user';
import {
  DashboardQuickLinks,
  type DashboardQuickLinkItem,
} from '@/features/dashboard/components/DashboardQuickLinks';
import type { BuyerDashboardSnapshot } from '@/features/dashboard/types/dashboard-home';
import { getServerTranslations } from '@/lib/i18n/server';

interface BuyerDashboardViewProps {
  user: AuthUser;
  snapshot: BuyerDashboardSnapshot;
  hasIndividualListerProfile: boolean;
}

export async function BuyerDashboardView({
  user,
  snapshot,
  hasIndividualListerProfile,
}: BuyerDashboardViewProps) {
  const { t } = await getServerTranslations();

  const quickLinks: DashboardQuickLinkItem[] = [
    {
      href: '/listings',
      label: t('dashboard.home.browseListings'),
      description: t('dashboard.home.browseListingsHint'),
      icon: Home,
    },
    {
      href: '/listings/map',
      label: t('map.mapView'),
      description: t('dashboard.home.viewMapHint'),
      icon: Map,
    },
    {
      href: '/dashboard/saved',
      label: t('dashboard.savedListings'),
      description: t('dashboard.home.savedListingsHint'),
      icon: Heart,
    },
    {
      href: '/dashboard/favorite-filters',
      label: t('dashboard.favoriteFilters.title'),
      description: t('dashboard.home.favoriteFiltersHint'),
      icon: Bookmark,
    },
    {
      href: '/dashboard/history',
      label: t('dashboard.history'),
      description: t('dashboard.home.historyHint'),
      icon: History,
    },
    {
      href: '/dashboard/messages',
      label: t('dashboard.messages'),
      description: t('dashboard.messages.hint'),
      icon: MessageCircle,
      badge: snapshot.unreadMessages,
    },
    {
      href: '/dashboard/profile',
      label: t('dashboard.profile'),
      description: t('dashboard.home.profileHint'),
      icon: User,
    },
  ];

  if (hasIndividualListerProfile) {
    quickLinks.splice(2, 0, {
      href: '/dashboard/listings',
      label: t('dashboard.listings'),
      description: t('dashboard.home.manageListingsHint'),
      icon: Home,
    });
  } else {
    quickLinks.push({
      href: '/dashboard/become-a-lister',
      label: t('dashboard.becomeALister'),
      description: t('dashboard.home.becomeListerHint'),
      icon: Sparkles,
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-var(--shadow-soft) sm:p-8">
        <p className="text-sm font-medium text-brand-dark">{t('dashboard.overview')}</p>
        <h1 className="mt-1 text-2xl font-bold text-primary-dark sm:text-3xl">
          {t('dashboard.welcome', { name: user.f_name })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">{t('dashboard.home.buyerHint')}</p>
      </header>

      <DashboardQuickLinks title={t('dashboard.home.quickLinks')} items={quickLinks} />
    </div>
  );
}
