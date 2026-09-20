'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Building2, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { AuthUser } from '@/features/auth/types/user';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import { splitWebsiteTitle, resolveWebsiteLogo } from '@/lib/website-settings/defaults';
import { getRoleHomePath } from '@/lib/auth/constants';
import { UserMenu } from '@/features/layout/components/UserMenu';
import { useSiteHeaderOverride } from '@/features/layout/context/site-header-override';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';
import { cn } from '@/lib/utils/cn';

interface SiteHeaderProps {
  user?: AuthUser | null;
  settings?: WebsiteSettings | null;
}

type NavItem = {
  href: string;
  labelKey: TranslationKey;
  isActive: (pathname: string) => boolean;
};

const PRIMARY_NAV: NavItem[] = [
  { href: '/', labelKey: 'nav.home', isActive: (p) => p === '/' },
  {
    href: '/listings',
    labelKey: 'nav.listings',
    isActive: (p) => p === '/listings' || (p.startsWith('/listings/') && p !== '/listings/map'),
  },
  { href: '/listings/map', labelKey: 'nav.map', isActive: (p) => p === '/listings/map' },
  { href: '/offices', labelKey: 'nav.offices', isActive: (p) => p.startsWith('/offices') },
  { href: '/about', labelKey: 'nav.about', isActive: (p) => p === '/about' },
  { href: '/contact', labelKey: 'nav.contact', isActive: (p) => p === '/contact' },
];

export function SiteHeader({ user = null, settings = null }: SiteHeaderProps) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const boxShadow = useTransform(
    scrollY,
    [0, 32],
    ['none', '0 1px 0 rgba(0,0,0,0.06), 0 8px 32px rgba(15,23,42,0.08)'],
  );
  const { override, hidden } = useSiteHeaderOverride();
  const brand = splitWebsiteTitle(settings?.title ?? 'عقارات اليمن');
  const logoUrl = resolveWebsiteLogo(settings?.header_logo_url);
  const isHome = pathname === '/';

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/listings') {
      return pathname === '/listings' || (pathname.startsWith('/listings/') && pathname !== '/listings/map');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const mobileLinks: Array<{ href: string; label: string }> = [
    ...PRIMARY_NAV.map(({ href, labelKey }) => ({ href, label: t(labelKey) })),
    ...(user ? [{ href: getRoleHomePath(user.role), label: t('nav.dashboard') }] : []),
  ];

  return (
    <>
      <motion.header
        style={{ boxShadow }}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'sticky top-0 z-50 border-b transition-colors',
          isHome
            ? 'border-white/10 bg-[#163d2e]/90 text-white backdrop-blur-md'
            : 'glass-panel border-gray-200/60',
        )}
      >
        <Container className="max-w-8xl">
          <div className="flex h-16 items-center justify-between gap-4 md:h-18">
            <Link href="/" className="group flex shrink-0 items-center gap-2.5">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={cn(
                  'flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl shadow-md md:h-14 md:w-14',
                  isHome ? 'bg-white/15 text-white shadow-black/10' : 'bg-brand text-white shadow-brand/20',
                )}
              >
                {settings?.header_logo_url ? (
                  <img src={logoUrl} alt={settings.title} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6 md:h-7 md:w-7" />
                )}
              </motion.span>
              <span
                className={cn(
                  'hidden text-lg font-bold tracking-tight sm:inline',
                  isHome ? 'text-white' : 'text-primary-dark',
                )}
              >
                <span className={isHome ? 'text-brand-light' : 'text-brand'}>{brand.primary}</span>
                {brand.secondary ? ` ${brand.secondary}` : ''}
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {PRIMARY_NAV.map(({ href, labelKey, isActive }) => {
                const active = isActive(pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                      isHome
                        ? active
                          ? 'bg-white/15 text-white'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                        : active
                          ? 'bg-brand-muted text-brand-dark'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-primary-dark',
                    )}
                  >
                    {t(labelKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              {!user ? (
                <ButtonLink
                  href="/register"
                  size="sm"
                  className={cn(
                    'hidden rounded-full sm:inline-flex',
                    isHome && 'border-white/25 bg-white/10 text-white hover:bg-white/20',
                  )}
                  variant={isHome ? 'outline' : 'primary'}
                >
                  {t('nav.host')}
                </ButtonLink>
              ) : null}

              {!user ? (
                <button
                  type="button"
                  onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    isHome ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100',
                  )}
                  aria-label={t('nav.toggleLanguage')}
                >
                  <Globe className="h-5 w-5" />
                </button>
              ) : null}

              {user ? (
                <UserMenu user={user} />
              ) : (
                <ButtonLink
                  href="/login"
                  size="sm"
                  className={cn(
                    'hidden rounded-full sm:inline-flex',
                    isHome && 'bg-white text-brand hover:bg-white/90',
                  )}
                >
                  {t('nav.login')}
                </ButtonLink>
              )}

              <button
                type="button"
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden',
                  isHome ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100',
                )}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={t('nav.toggleMenu')}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={cn(
                'space-y-1 border-t py-4 lg:hidden',
                isHome ? 'border-white/10' : 'border-gray-100',
              )}
            >
              {mobileLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    isLinkActive(href)
                      ? isHome
                        ? 'bg-white/10 text-white'
                        : 'bg-gray-100 text-primary-dark'
                      : isHome
                        ? 'text-white/80 hover:bg-white/10'
                        : 'text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {label}
                </Link>
              ))}

              {!user ? (
                <div className="flex gap-2 px-1 pt-2 sm:hidden">
                  <ButtonLink
                    href="/login"
                    variant="outline"
                    className={cn('flex-1 rounded-xl', isHome && 'border-white/30 text-white')}
                  >
                    {t('nav.login')}
                  </ButtonLink>
                  <ButtonLink href="/register" className="flex-1 rounded-xl">
                    {t('nav.register')}
                  </ButtonLink>
                </div>
              ) : null}
            </motion.nav>
          ) : null}
        </Container>
      </motion.header>

      <motion.div
        initial={false}
        animate={{ y: hidden ? '0%' : '-100%' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed inset-x-0 top-0 z-50 glass-panel border-b border-gray-200/60"
        aria-hidden={!hidden}
      >
        {override}
      </motion.div>
    </>
  );
}
