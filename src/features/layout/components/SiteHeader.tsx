'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Building2, Globe, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { AuthUser } from '@/features/auth/types/user';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import { splitWebsiteTitle, resolveWebsiteLogo } from '@/lib/website-settings/defaults';
import { getRoleHomePath } from '@/lib/auth/constants';
import { UserMenu } from '@/features/layout/components/UserMenu';
import { useSiteHeaderOverride } from '@/features/layout/context/site-header-override';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface SiteHeaderProps {
  categoryNav: ReactNode;
  user?: AuthUser | null;
  settings?: WebsiteSettings | null;
}

export function SiteHeader({ categoryNav, user = null, settings = null }: SiteHeaderProps) {
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

  return (
    <>
      <motion.header
        style={{ boxShadow }}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="sticky top-0 z-50 glass-panel border-b border-gray-200/60"
      >
        <Container className='max-w-8xl' >
          <div className="flex h-18 items-center gap-4 justify-between">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-brand/20 overflow-hidden"
              >
                {settings?.header_logo_url ? (
                  <img src={logoUrl} alt={settings.title} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </motion.span>
              <span className="text-lg font-bold tracking-tight text-primary-dark hidden sm:inline">
                <span className="text-brand">{brand.primary}</span>
                {brand.secondary ? ` ${brand.secondary}` : ''}
              </span>
            </Link>

            <div className="hidden md:block border-t border-gray-100 pb-3 pt-4">
              {categoryNav}
            </div>

            <div className="flex items-center gap-1.5">
              {!user ? (
                <ButtonLink
                  href="/register"
                  size="sm"
                  className="rounded-full"
                >
                  {t('nav.host')}
                </ButtonLink>
              ) : null
              }

              {!user ? (
                <button
                  type="button"
                  onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                  aria-label={t('nav.toggleLanguage')}
                >
                  <Globe className="h-5 w-5" />
                </button>
              ) : null}

              {user ? (
                <UserMenu user={user} />
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <ButtonLink href="/login" size="sm" className="rounded-full">
                    {t('nav.login')}
                  </ButtonLink>
                </div>
              )}

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors md:hidden"
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
              className="md:hidden border-t border-gray-100 py-4 space-y-2"
            >
              {[
                { href: '/', label: t('nav.home') },
                { href: '/listings', label: t('nav.listings') },
                { href: '/listings/map', label: t('nav.map') },
                ...(user
                  ? [{ href: getRoleHomePath(user.role), label: t('nav.dashboard') }]
                  : []),
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    pathname === href ? 'bg-gray-100 text-primary-dark' : 'text-gray-600',
                  )}
                >
                  {label}
                </Link>
              ))}

              {!user ? (
                <div className="flex gap-2 px-1 pt-2 sm:hidden">
                  <ButtonLink href="/login" variant="outline" className="flex-1 rounded-xl">
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
