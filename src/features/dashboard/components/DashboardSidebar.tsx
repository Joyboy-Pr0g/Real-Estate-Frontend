'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  ChevronsLeft,
  ChevronsRight,
  Flag,
  Heart,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Users,
  X,
  Bookmark,
} from 'lucide-react';
import { AuthUser } from '@/features/auth/types/user';
import { logout } from '@/features/auth/services/auth-service';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { Button, ButtonLink } from '@/components/ui/button';
import type { TranslationKey } from '@/lib/i18n/ar';

interface DashboardSidebarProps {
  user: AuthUser;
  hasIndividualListerProfile: boolean;
}

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
  exact: boolean;
}

const SIDEBAR_COMPACT_KEY = 're-dashboard-sidebar-compact';

function buildNavItems(isOffice: boolean, hasIndividualListerProfile: boolean): NavItem[] {
  const items: NavItem[] = [
    { href: '/dashboard', labelKey: 'dashboard.overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/saved', labelKey: 'dashboard.savedListings', icon: Heart, exact: false },
    { href: '/dashboard/favorite-filters', labelKey: 'dashboard.favoriteFilters.title', icon: Bookmark, exact: false },
    { href: '/dashboard/history', labelKey: 'dashboard.history', icon: History, exact: false },
    { href: '/dashboard/reports', labelKey: 'dashboard.reports', icon: Flag, exact: false },
  ];

  if (isOffice) {
    items.push(
      { href: '/dashboard/office', labelKey: 'dashboard.office', icon: Building2, exact: false },
      { href: '/dashboard/office/listings', labelKey: 'dashboard.officeListings', icon: Home, exact: false },
      { href: '/dashboard/office/analytics', labelKey: 'dashboard.office.analyticsNav', icon: LayoutDashboard, exact: false },
      { href: '/dashboard/office/users', labelKey: 'dashboard.office.userAnalyticsNav', icon: Users, exact: false },
    );
    return items;
  }

  if (hasIndividualListerProfile) {
    items.push({ href: '/dashboard/listings', labelKey: 'dashboard.listings', icon: Home, exact: false });
  }

  items.push({
    href: '/dashboard/become-a-lister',
    labelKey: 'dashboard.becomeALister',
    icon: Sparkles,
    exact: false,
  });

  return items;
}

export function DashboardSidebar({ user, hasIndividualListerProfile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
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

  const navItems = buildNavItems(user.role === 'office', hasIndividualListerProfile);

  const brand = (
    <div
      className={cn(
        'flex shrink-0 border-b border-gray-100',
        compact ? 'flex-col items-center gap-2 px-2 py-3 lg:px-1.5' : 'items-center gap-2.5 px-5 py-4',
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
        <LayoutDashboard className="h-4 w-4" />
      </span>

      {!compact && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-primary-dark">{t('dashboard.title')}</p>
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

  const nav = (
    <nav className={cn('min-h-0 flex-1 space-y-1 overflow-y-auto py-3', compact ? 'px-2 lg:px-1.5' : 'px-3')}>
      {navItems.map(({ href, labelKey, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const label = t(labelKey);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            onClick={() => setOpen(false)}
            title={compact ? label : undefined}
            aria-label={compact ? label : undefined}
            className={cn(
              'inline-flex w-full shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              compact && 'lg:justify-center lg:gap-0 lg:px-2',
              active
                ? 'bg-brand-muted text-brand-dark'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-dark',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={cn('truncate', compact && 'lg:hidden')}>{label}</span>
          </Link>
        );
      })}
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
            <LayoutDashboard className="h-3.5 w-3.5" />
          </span>
          <p className="truncate text-sm font-bold text-primary-dark">{t('dashboard.title')}</p>
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
          'fixed inset-y-0 start-0 w-72 max-w-[85vw] border-e transition-[transform,width] duration-200 ease-out',
          'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-[width]',
          compact ? 'lg:w-[4.5rem]' : 'lg:w-64',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0',
        )}
      >
        <div className="relative shrink-0">
          {brand}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-3 end-2 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-dark lg:hidden"
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
