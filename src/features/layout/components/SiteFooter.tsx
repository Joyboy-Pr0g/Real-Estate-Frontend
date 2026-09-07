'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { Container } from '@/components/ui/container';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { TranslationKey } from '@/lib/i18n/ar';
import {
  FOOTER_LINKS,
  FOOTER_MOCK,
  FOOTER_SECTION_KEYS,
} from '@/features/layout/constants/footer-mock';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import {
  FALLBACK_WEBSITE_SETTINGS,
  formatWhatsappLink,
  splitWebsiteTitle,
  withWebsiteSettingsDefaults,
} from '@/lib/website-settings/defaults';

interface SiteFooterProps {
  settings?: WebsiteSettings | null;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

export function SiteFooter({ settings = null }: SiteFooterProps) {
  const { t, locale } = useLocale();
  const year = new Date().getFullYear();
  const resolved = withWebsiteSettingsDefaults(settings ?? FALLBACK_WEBSITE_SETTINGS);
  const brand = splitWebsiteTitle(resolved.title);

  const description =
    locale === 'ar'
      ? resolved.description ?? FOOTER_MOCK.description.ar
      : resolved.description ?? FOOTER_MOCK.description.en;

  const browseLinks = useMemo(
    () =>
      FOOTER_LINKS.browse.map((link) => ({
        href: link.href,
        label: t(link.labelKey),
      })),
    [t],
  );

  const companyLinks = useMemo(
    () =>
      FOOTER_LINKS.company.map((link) => ({
        href: link.href,
        label: t(link.labelKey),
      })),
    [t],
  );

  const accountLinks = useMemo(
    () =>
      FOOTER_LINKS.account.map((link) => ({
        href: link.href,
        label: t(link.labelKey),
      })),
    [t],
  );

  const sections: { key: keyof typeof FOOTER_SECTION_KEYS; links: { href: string; label: string }[] }[] =
    [
      { key: 'browse', links: browseLinks },
      { key: 'company', links: companyLinks },
      { key: 'account', links: accountLinks },
    ];

  const socialLinks = [
    resolved.facebook
      ? { href: resolved.facebook, icon: FacebookIcon, label: 'Facebook' }
      : null,
    resolved.instagram
      ? { href: resolved.instagram, icon: InstagramIcon, label: 'Instagram' }
      : null,
    resolved.whatsapp
      ? { href: formatWhatsappLink(resolved.whatsapp), icon: MessageCircle, label: 'WhatsApp' }
      : null,
    resolved.tiktok ? { href: resolved.tiktok, icon: TikTokIcon, label: 'TikTok' } : null,
  ].filter(Boolean) as { href: string; icon: typeof FacebookIcon; label: string }[];

  const phone = resolved.website_phone ?? FOOTER_MOCK.phone;
  const email = resolved.website_email ?? FOOTER_MOCK.email;

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <Container className="py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
                <Building2 className="h-6 w-6" />
              </span>
              <span className="text-xl font-bold text-primary-dark">
                <span className="text-secondary">{brand.primary}</span>
                {brand.secondary ? ` ${brand.secondary}` : ''}
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">{description}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary shrink-0" />
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="hover:text-primary transition-colors"
                >
                  {phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-primary transition-colors"
                >
                  {email}
                </a>
              </p>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.key}>
              <h4 className="text-sm font-semibold text-primary-dark mb-4">
                {t(FOOTER_SECTION_KEYS[section.key] as TranslationKey)}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={`${section.key}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="my-8 h-px bg-gray-200" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <p className="text-xs text-gray-400">
              © {year}{' '}
              <Link
                href="https://www.injazdev.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Injaz Dev
              </Link>
              . {t('footer.rights')}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
