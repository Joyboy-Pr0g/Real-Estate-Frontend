import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';

export const DEFAULT_WEBSITE_LOGO = '/real_image.jpg';

export const FALLBACK_WEBSITE_SETTINGS: WebsiteSettings = {
  id: 'fallback',
  title: 'عقارات اليمن',
  description:
    'منصة عقارية يمنية تجمع آلاف العقارات من مكاتب موثّقة. ابحث عن شقق وفيلات وأراضٍ للبيع والإيجار في صنعاء وعدن وتعز وجميع المحافظات.',
  website_email: 'info@aqarat-yemen.com',
  website_phone: '+967 777 000 000',
  support_email: 'support@aqarat-yemen.com',
  legal_entity_name: 'عقارات اليمن',
  address_text: 'صنعاء، الجمهورية اليمنية',
  header_logo_url: null,
  header_logo_public_id: null,
  footer_logo_url: null,
  footer_logo_public_id: null,
  favicon_url: null,
  favicon_public_id: null,
  og_image_url: null,
  og_image_public_id: null,
  default_listing_og_fallback_url: null,
  default_listing_og_fallback_public_id: null,
  facebook: 'https://facebook.com/aqarat-yemen',
  instagram: 'https://instagram.com/aqarat-yemen',
  whatsapp: '+967777000000',
  tiktok: 'https://tiktok.com/@aqarat-yemen',
  site_url: null,
  meta_title: 'عقارات اليمن | Real Estate Marketplace in Yemen',
  meta_description:
    'اعثر على منزلك في اليمن — آلاف العقارات المعروضة من مكاتب عقارية موثّقة. بحث متقدم، خرائط تفاعلية، وتواصل مباشر مع الوكلاء.',
  meta_keywords:
    'عقارات اليمن, real estate Yemen, شقق للبيع, فلل للإيجار, أراضي, صنعاء, عدن, تعز, مكاتب عقارية',
  robots: 'index, follow',
  twitter_card: 'summary_large_image',
  twitter_handle: null,
  default_locale: 'ar_YE',
  theme_color: '#1e6b45',
  google_site_verification: null,
  google_analytics_id: null,
  facebook_domain_verification: null,
  index_listing_search_pages: false,
  index_office_profiles: true,
  allow_public_indexing: true,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export function resolveWebsiteLogo(url?: string | null): string {
  return url?.trim() || DEFAULT_WEBSITE_LOGO;
}

export function withWebsiteSettingsDefaults(settings: WebsiteSettings): WebsiteSettings {
  return {
    ...settings,
    title: settings.title?.trim() || FALLBACK_WEBSITE_SETTINGS.title,
    website_email: settings.website_email?.trim() || FALLBACK_WEBSITE_SETTINGS.website_email,
    website_phone: settings.website_phone?.trim() || FALLBACK_WEBSITE_SETTINGS.website_phone,
    support_email: settings.support_email?.trim() || FALLBACK_WEBSITE_SETTINGS.support_email,
    legal_entity_name: settings.legal_entity_name?.trim() || FALLBACK_WEBSITE_SETTINGS.legal_entity_name,
    address_text: settings.address_text?.trim() || FALLBACK_WEBSITE_SETTINGS.address_text,
    facebook: settings.facebook?.trim() || FALLBACK_WEBSITE_SETTINGS.facebook,
    instagram: settings.instagram?.trim() || FALLBACK_WEBSITE_SETTINGS.instagram,
    whatsapp: settings.whatsapp?.trim() || FALLBACK_WEBSITE_SETTINGS.whatsapp,
    tiktok: settings.tiktok?.trim() || FALLBACK_WEBSITE_SETTINGS.tiktok,
    description: settings.description?.trim() || FALLBACK_WEBSITE_SETTINGS.description,
    meta_title: settings.meta_title?.trim() || FALLBACK_WEBSITE_SETTINGS.meta_title,
    meta_description: settings.meta_description?.trim() || FALLBACK_WEBSITE_SETTINGS.meta_description,
    meta_keywords: settings.meta_keywords?.trim() || FALLBACK_WEBSITE_SETTINGS.meta_keywords,
    site_url: settings.site_url?.trim() || FALLBACK_WEBSITE_SETTINGS.site_url,
    twitter_card: settings.twitter_card?.trim() || FALLBACK_WEBSITE_SETTINGS.twitter_card,
    twitter_handle: settings.twitter_handle?.trim() || FALLBACK_WEBSITE_SETTINGS.twitter_handle,
    default_locale: settings.default_locale?.trim() || FALLBACK_WEBSITE_SETTINGS.default_locale,
    theme_color: settings.theme_color?.trim() || FALLBACK_WEBSITE_SETTINGS.theme_color,
    robots: settings.robots?.trim() || FALLBACK_WEBSITE_SETTINGS.robots,
  };
}

export function formatWhatsappLink(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : trimmed;
}

export function splitWebsiteTitle(title: string): { primary: string; secondary: string } {
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 1) return { primary: title, secondary: '' };
  return { primary: parts[0], secondary: parts.slice(1).join(' ') };
}
