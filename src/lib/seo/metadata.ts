import type { Metadata } from 'next';
import { env } from '@/env';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import type { PublicListingDetail } from '@/features/listings/types/listing-detail';
import { getListingCanonicalPath } from '@/lib/seo/indexing';
import { withWebsiteSettingsDefaults, resolveWebsiteLogo } from '@/lib/website-settings/defaults';
import type { Locale } from '@/lib/i18n/config';

export function getSiteUrl(settings: WebsiteSettings): string {
  const fromEnv = env.NEXT_PUBLIC_SITE_URL?.trim() || env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const fromSettings = settings.site_url?.trim();
  if (fromSettings) return fromSettings.replace(/\/$/, '');
  return 'https://yemen-land.com';
}

export function shouldAllowIndexing(settings: WebsiteSettings): boolean {
  if (env.NEXT_PUBLIC_IS_PRODUCTION !== 'true') return false;
  return settings.allow_public_indexing !== false;
}

function absoluteAssetUrl(siteUrl: string, asset?: string | null): string {
  const value = asset?.trim() || resolveWebsiteLogo(null);
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

/** Normalizes route segments so `/` and `` both map to the site root (no trailing slash). */
export function normalizePagePath(path?: string): string {
  const raw = (path ?? '').trim();
  if (!raw || raw === '/') return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function buildCanonicalUrl(siteUrl: string, path?: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const segment = normalizePagePath(path);
  return segment ? `${base}${segment}` : base;
}

function resolveHreflangKey(locale?: Locale): 'ar-YE' | 'en' {
  return locale === 'en' ? 'en' : 'ar-YE';
}

function buildHreflangAlternates(
  siteUrl: string,
  path?: string,
  locale?: Locale,
): NonNullable<Metadata['alternates']> {
  const url = buildCanonicalUrl(siteUrl, path);
  const selfHreflang = resolveHreflangKey(locale);

  return {
    canonical: url,
    languages: {
      [selfHreflang]: url,
      'x-default': url,
    },
  };
}

function buildVerificationMeta(settings: WebsiteSettings): Metadata['verification'] {
  const verification: NonNullable<Metadata['verification']> = {};
  if (settings.google_site_verification?.trim()) {
    verification.google = settings.google_site_verification.trim();
  }
  if (settings.facebook_domain_verification?.trim()) {
    verification.other = {
      'facebook-domain-verification': settings.facebook_domain_verification.trim(),
    };
  }
  return Object.keys(verification).length ? verification : undefined;
}

function resolveRobots(settings: WebsiteSettings, pageRobots?: Metadata['robots']): Metadata['robots'] {
  if (!shouldAllowIndexing(settings)) {
    return { index: false, follow: false };
  }
  return pageRobots ?? settings.robots ?? 'index, follow';
}

export function buildOrganizationSchema(settings: WebsiteSettings) {
  const s = withWebsiteSettingsDefaults(settings);
  const siteUrl = getSiteUrl(s);
  const logoUrl = absoluteAssetUrl(siteUrl, s.header_logo_url || s.favicon_url);
  const ogImage = absoluteAssetUrl(siteUrl, s.og_image_url || s.header_logo_url);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.legal_entity_name || s.title,
    url: siteUrl,
    logo: logoUrl,
    image: ogImage,
    description: s.description || s.meta_description,
    sameAs: [s.facebook, s.instagram, s.tiktok, s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/\D/g, '')}` : undefined].filter(
      Boolean,
    ),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: s.support_email || s.website_email || undefined,
      telephone: s.website_phone || undefined,
      areaServed: 'YE',
      availableLanguage: ['Arabic', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address_text || undefined,
      addressCountry: 'YE',
    },
  };
}

export function buildWebSiteSchema(settings: WebsiteSettings) {
  const s = withWebsiteSettingsDefaults(settings);
  const siteUrl = getSiteUrl(s);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: s.title,
    url: siteUrl,
    description: s.meta_description || s.description,
    inLanguage: ['ar-YE', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/listings?city={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildRealEstateListingSchema(
  settings: WebsiteSettings,
  listing: PublicListingDetail,
  siteUrl?: string,
) {
  const s = withWebsiteSettingsDefaults(settings);
  const baseUrl = siteUrl ?? getSiteUrl(s);
  const mainPhoto = listing.photos.find((photo) => photo.is_main) ?? listing.photos[0];
  const fallbackImage = s.default_listing_og_fallback_url || s.og_image_url || s.header_logo_url;
  const imageUrl = mainPhoto?.url || fallbackImage;
  const canonicalPath = getListingCanonicalPath(listing.slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description.slice(0, 500),
    url: `${baseUrl}${canonicalPath}`,
    datePosted: listing.published_at || listing.created_at,
    image: imageUrl ? absoluteAssetUrl(baseUrl, imageUrl) : undefined,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'YER',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.neighborhood.name,
      addressRegion: listing.city.name,
      addressCountry: 'YE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude,
      longitude: listing.longitude,
    },
  };
}

export async function getRootOrganizationSchema() {
  try {
    const { getWebsiteSettingsServer } = await import(
      '@/features/website-settings/services/website-settings-server'
    );
    const settings = await getWebsiteSettingsServer();
    return buildOrganizationSchema(settings);
  } catch {
    const { FALLBACK_WEBSITE_SETTINGS } = await import('@/lib/website-settings/defaults');
    return buildOrganizationSchema(FALLBACK_WEBSITE_SETTINGS);
  }
}

export function buildSiteMetadata(settings: WebsiteSettings, overrides?: Metadata): Metadata {
  const s = withWebsiteSettingsDefaults(settings);
  const siteUrl = getSiteUrl(s);
  const siteName = s.title;
  const title = s.meta_title?.trim() || siteName;
  const description = s.meta_description?.trim() || s.description || '';
  const ogImage = absoluteAssetUrl(siteUrl, s.og_image_url || s.header_logo_url);
  const keywords = s.meta_keywords
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const favicon = absoluteAssetUrl(siteUrl, s.favicon_url);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: keywords?.length ? keywords : undefined,
    robots: resolveRobots(s),
    alternates: buildHreflangAlternates(siteUrl),
    verification: buildVerificationMeta(s),
    icons: {
      icon: [{ url: favicon, sizes: 'any' }],
      apple: [{ url: favicon, sizes: '180x180' }],
      shortcut: [favicon],
    },
    openGraph: {
      type: 'website',
      locale: s.default_locale ?? 'ar_YE',
      alternateLocale: ['en'],
      url: siteUrl,
      siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: (s.twitter_card as 'summary' | 'summary_large_image') ?? 'summary_large_image',
      site: s.twitter_handle ?? undefined,
      title,
      description,
      images: [ogImage],
    },
    ...overrides,
  };
}

export function buildPageMetadata(
  settings: WebsiteSettings,
  page: {
    title: string;
    description?: string;
    path?: string;
    image?: string | null;
    type?: 'website' | 'article';
    robots?: Metadata['robots'];
  },
  locale?: Locale,
): Metadata {
  const s = withWebsiteSettingsDefaults(settings);
  const siteUrl = getSiteUrl(s);
  const description = page.description?.trim() || s.meta_description?.trim() || s.description || '';
  const image = absoluteAssetUrl(siteUrl, page.image || s.og_image_url || s.header_logo_url);
  const path = page.path ?? '';
  const url = buildCanonicalUrl(siteUrl, path);

  return {
    title: page.title,
    description,
    robots: resolveRobots(s, page.robots),
    alternates: buildHreflangAlternates(siteUrl, path, locale),
    openGraph: {
      type: page.type ?? 'website',
      url,
      title: page.title,
      description,
      siteName: s.title,
      locale: s.default_locale ?? 'ar_YE',
      alternateLocale: ['en'],
      images: [{ url: image, width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: (s.twitter_card as 'summary' | 'summary_large_image') ?? 'summary_large_image',
      title: page.title,
      description,
      images: [image],
    },
  };
}

export async function getRootMetadata(): Promise<Metadata> {
  try {
    const { getWebsiteSettingsServer } = await import(
      '@/features/website-settings/services/website-settings-server'
    );
    const settings = await getWebsiteSettingsServer();
    return buildSiteMetadata(settings);
  } catch {
    const { FALLBACK_WEBSITE_SETTINGS } = await import('@/lib/website-settings/defaults');
    return buildSiteMetadata(FALLBACK_WEBSITE_SETTINGS);
  }
}

export async function getRootViewport() {
  try {
    const { getWebsiteSettingsServer } = await import(
      '@/features/website-settings/services/website-settings-server'
    );
    const settings = withWebsiteSettingsDefaults(await getWebsiteSettingsServer());
    return {
      themeColor: settings.theme_color ?? '#1e6b45',
    };
  } catch {
    return { themeColor: '#1e6b45' };
  }
}

export async function getPageMetadataFromSettings(
  page: Parameters<typeof buildPageMetadata>[1],
  locale?: Locale,
): Promise<Metadata> {
  const { getWebsiteSettingsServer } = await import(
    '@/features/website-settings/services/website-settings-server'
  );
  const { getServerLocale } = await import('@/lib/i18n/server');
  const settings = await getWebsiteSettingsServer();
  const resolvedLocale = locale ?? (await getServerLocale());
  return buildPageMetadata(settings, page, resolvedLocale);
}

export async function getWebsiteSettingsForMetadata(): Promise<WebsiteSettings> {
  const { getWebsiteSettingsServer } = await import(
    '@/features/website-settings/services/website-settings-server'
  );
  return getWebsiteSettingsServer();
}
