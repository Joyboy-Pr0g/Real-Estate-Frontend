'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeftRight,
  Building2,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  User,
  ClipboardList,
  Clock,
  Flag,
  Home,
  KeyRound,
  Landmark,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  ListTree,
  LogOut,
  MapPin,
  Megaphone,
  MessageCircle,
  Menu,
  Send,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { AuthUser } from '@/features/auth/types/user';
import { logout } from '@/features/auth/services/auth-service';
import { useAdminNavBadges } from '@/features/admin/hooks/use-admin-nav-badges';
import { useNotificationUnreadCount } from '@/features/notifications/hooks/use-notification-unread-count';
import { usePermissions } from '@/features/admin/providers/permissions-provider';
import { canAccessAdminPath } from '@/lib/auth/admin-route-permissions';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { Button, ButtonLink } from '@/components/ui/button';

interface AdminSidebarProps {
  user: AuthUser;
}

const SIDEBAR_COMPACT_KEY = 're-admin-sidebar-compact';

const navItems = [
  { href: '/admin', labelKey: 'admin.dashboard' as const, icon: LayoutDashboard, exact: true },
  { href: '/admin/users', labelKey: 'admin.users' as const, icon: Users, exact: false },
  { href: '/admin/offices', labelKey: 'admin.offices' as const, icon: Building2, exact: true },
  {
    href: '/admin/offices/pending',
    labelKey: 'admin.pendingOffices' as const,
    icon: Clock,
    exact: false,
    badgeKey: 'pending_offices' as const,
  },
  { href: '/admin/individual-listers', labelKey: 'admin.individualListers' as const, icon: Sparkles, exact: true },
  {
    href: '/admin/individual-listers/pending',
    labelKey: 'admin.pendingIndividualListers' as const,
    icon: Clock,
    exact: false,
    badgeKey: 'pending_individual_listers' as const,
  },
  { href: '/admin/listings', labelKey: 'admin.listings' as const, icon: Home, exact: false },
  {
    href: '/admin/reports',
    labelKey: 'admin.listingReports.nav' as const,
    icon: Flag,
    exact: false,
    badgeKey: 'pending_listing_reports' as const,
    totalBadgeKey: 'total_listing_reports' as const,
  },
  {
    href: '/admin/messaging/reports',
    labelKey: 'admin.messaging.reports' as const,
    icon: MessageCircle,
    exact: false,
    badgeKey: 'pending_conversation_reports' as const,
    totalBadgeKey: 'total_conversation_reports' as const,
  },
  {
    href: '/admin/messaging/conversations',
    labelKey: 'admin.messaging.conversations' as const,
    icon: MessageCircle,
    exact: false,
  },
  {
    href: '/admin/support-tickets',
    labelKey: 'admin.supportTickets.title' as const,
    icon: LifeBuoy,
    exact: false,
  },
  {
    href: '/admin/notifications',
    labelKey: 'admin.notifications.title' as const,
    icon: Bell,
    exact: false,
  },
  {
    href: '/admin/announcements/campaigns',
    labelKey: 'admin.announcements.campaigns' as const,
    icon: Megaphone,
    exact: false,
  },
  {
    href: '/admin/announcements/send',
    labelKey: 'admin.announcements.send' as const,
    icon: Send,
    exact: true,
  },
  { href: '/admin/office-action-logs', labelKey: 'admin.officeActionLogs' as const, icon: ClipboardList, exact: false },
  { href: '/admin/property-types', labelKey: 'admin.propertyTypes' as const, icon: Home, exact: false },
  { href: '/admin/property-subtypes', labelKey: 'admin.propertySubtypes' as const, icon: Layers, exact: false },
  { href: '/admin/transaction-types', labelKey: 'admin.transactionTypes' as const, icon: ArrowLeftRight, exact: false },
  { href: '/admin/features', labelKey: 'admin.mainFeatures' as const, icon: Sparkles, exact: false },
  { href: '/admin/sub-features', labelKey: 'admin.subFeatures' as const, icon: ListTree, exact: false },
  { href: '/admin/cities', labelKey: 'admin.cities' as const, icon: Landmark, exact: false },
  { href: '/admin/neighborhoods', labelKey: 'admin.neighborhoods' as const, icon: MapPin, exact: false },
  { href: '/admin/website-settings', labelKey: 'admin.websiteSettings.nav' as const, icon: Settings, exact: true },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const { isPlatformAdmin, permissions, hasPermission } = usePermissions();
  const adminBadges = useAdminNavBadges();
  const notificationUnreadCount = useNotificationUnreadCount();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIDEBAR_COMPACT_KEY) === 'true';
  });

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const toggleCompact = () => {
    setCompact((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COMPACT_KEY, String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const brand = (
    <div
      className={cn(
        'flex shrink-0 border-b border-gray-100',
        compact ? 'flex-col items-center gap-2 px-2 py-3 lg:px-1.5' : 'items-center gap-2.5 px-5 py-4',
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
        <Building2 className="h-4 w-4" />
      </span>

      {!compact && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-primary-dark">{t('admin.title')}</p>
          <p className="truncate text-xs text-gray-500">
            {user.f_name} {user.l_name}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={toggleCompact}
        className={cn(
          'hidden shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-dark lg:inline-flex',
          !compact && 'ms-auto',
        )}
        aria-label={compact ? t('admin.sidebarExpand') : t('admin.sidebarCollapse')}
        title={compact ? t('admin.sidebarExpand') : t('admin.sidebarCollapse')}
      >
        {compact ? (
          <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
        ) : (
          <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
        )}
      </button>
    </div>
  );

  const visibleNavItems = [
    ...navItems.filter(
      (item) => isPlatformAdmin || canAccessAdminPath(item.href, permissions),
    ),
    ...(isPlatformAdmin
      ? [
          { href: '/admin/system-status', labelKey: 'admin.systemStatus.nav' as const, icon: Activity, exact: true },
          { href: '/admin/permissions', labelKey: 'admin.permissions.nav' as const, icon: KeyRound, exact: true },
        ]
      : []),
  ].filter((item) => {
    if (item.href === '/admin/announcements/send') {
      return hasPermission('announcements.send');
    }
    return true;
  });

  const nav = (
    <nav className={cn('min-h-0 flex-1 space-y-1 overflow-y-auto py-3', compact ? 'px-2 lg:px-1.5' : 'px-3')}>
      {visibleNavItems.map((item) => {
        const { href, labelKey, icon: Icon, exact } = item;
        const badgeKey = 'badgeKey' in item ? item.badgeKey : undefined;
        const totalBadgeKey = 'totalBadgeKey' in item ? item.totalBadgeKey : undefined;
        const active = exact ? pathname === href : pathname.startsWith(href);
        const label = t(labelKey);
        const badgeCount = badgeKey ? adminBadges[badgeKey] : href === '/admin/notifications' ? notificationUnreadCount : 0;
        const totalCount = totalBadgeKey ? adminBadges[totalBadgeKey] : 0;
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            onClick={() => setOpen(false)}
            title={compact ? label : undefined}
            aria-label={compact ? label : undefined}
            className={cn(
              'relative inline-flex w-full shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              compact && 'lg:justify-center lg:gap-0 lg:px-2',
              active
                ? 'bg-brand-muted text-brand-dark'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-dark',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={cn('truncate', compact && 'lg:hidden')}>
              {label}
              {!compact && totalCount > 0 ? (
                <span className="ms-1 text-xs font-normal text-gray-400">({totalCount})</span>
              ) : null}
            </span>
            {badgeCount > 0 ? (
              <span
                className={cn(
                  'ms-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white',
                  compact && 'lg:absolute lg:top-1.5 lg:inset-e-1.5 lg:ms-0 lg:h-2 lg:min-w-2 lg:px-0 lg:text-[0]',
                )}
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            ) : null}
          </Link>
        );
      })}
      <Link
        href="/admin/profile"
        prefetch={false}
        onClick={() => setOpen(false)}
        title={compact ? t('admin.profile.nav') : undefined}
        aria-label={compact ? t('admin.profile.nav') : undefined}
        className={cn('relative inline-flex w-full shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors', compact && 'lg:justify-center lg:gap-0 lg:px-2')}
      >
        <User className="h-4 w-4 shrink-0" />
        <span className={cn('truncate', compact && 'lg:hidden')}>{t('admin.profile.nav')}</span>
      </Link>
    </nav>
  );

  const footer = (
    <div className={cn('shrink-0 border-t border-gray-100', compact ? 'px-2 py-3 lg:px-1.5' : 'px-3 py-4')}>
      {!compact && (
        <p className="mb-2 truncate px-1 text-xs text-gray-500">
          {user.f_name} {user.l_name}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <ButtonLink
          href="/"
          className={cn('w-full rounded-xl', compact && 'lg:justify-center lg:px-2')}
          variant="primaryOutline"
          aria-label={compact ? t('admin.backToSite') : undefined}
        >
          <Home className="h-3.5 w-3.5 shrink-0" />
          <span className={cn(compact && 'lg:hidden')}>{t('admin.backToSite')}</span>
        </ButtonLink>

        <Button
          type="button"
          onClick={handleLogout}
          title={compact ? t('admin.logout') : undefined}
          aria-label={compact ? t('admin.logout') : undefined}
          className={cn('w-full rounded-xl', compact && 'lg:justify-center lg:px-2')}
          variant="dangerOutline"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          <span className={cn(compact && 'lg:hidden')}>{t('admin.logout')}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-dark"
          aria-label={t('nav.toggleMenu')}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <Building2 className="h-3.5 w-3.5" />
          </span>
          <p className="truncate text-sm font-bold text-primary-dark">{t('admin.title')}</p>
        </div>
      </div>

      {open ? (
        <button
          type="button"
          aria-label={t('admin.close')}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'z-50 flex min-h-0 flex-col border-gray-200 bg-white',
          'fixed inset-y-0 inset-s-0 w-72 max-w-[85vw] border-e transition-[transform,width] duration-200 ease-out',
          'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-[width]',
          compact ? 'lg:w-18' : 'lg:w-64',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0',
        )}
      >
        <div className="relative shrink-0">
          {brand}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-3 inset-e-2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-dark lg:hidden"
            aria-label={t('admin.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
