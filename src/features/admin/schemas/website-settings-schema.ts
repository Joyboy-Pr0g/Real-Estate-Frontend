import { z } from 'zod';
import type { TranslationKey } from '@/lib/i18n/ar';

export function createWebsiteSettingsSchema(t: (key: TranslationKey) => string) {
  return z.object({
    title: z.string().min(1, t('validation.titleRequired')).max(200),
    website_email: z.union([z.string().email(t('validation.invalidEmail')), z.literal('')]).optional(),
    website_phone: z.string().max(50).optional(),
    support_email: z.union([z.string().email(t('validation.invalidEmail')), z.literal('')]).optional(),
    legal_entity_name: z.string().max(255).optional(),
    address_text: z.string().max(2000).optional(),
    facebook: z.string().max(500).optional(),
    instagram: z.string().max(500).optional(),
    whatsapp: z.string().max(500).optional(),
    tiktok: z.string().max(500).optional(),
    description: z.string().max(2000).optional(),
    meta_title: z.string().max(200).optional(),
    meta_description: z.string().max(2000).optional(),
    meta_keywords: z.string().max(500).optional(),
    site_url: z.union([z.string().url(t('validation.invalidUrl')), z.literal('')]).optional(),
    twitter_card: z.enum(['summary', 'summary_large_image']).optional(),
    twitter_handle: z.string().max(100).optional(),
    default_locale: z.string().max(20).optional(),
    theme_color: z.string().max(20).optional(),
    robots: z.string().max(100).optional(),
    google_site_verification: z.string().max(255).optional(),
    google_analytics_id: z.string().max(100).optional(),
    facebook_domain_verification: z.string().max(255).optional(),
    index_listing_search_pages: z.boolean().optional(),
    index_office_profiles: z.boolean().optional(),
    allow_public_indexing: z.boolean().optional(),
    remove_header_logo: z.boolean().optional(),
    remove_footer_logo: z.boolean().optional(),
    remove_favicon: z.boolean().optional(),
    remove_og_image: z.boolean().optional(),
    remove_default_listing_og_fallback: z.boolean().optional(),
  });
}

export type WebsiteSettingsFormValues = z.infer<ReturnType<typeof createWebsiteSettingsSchema>>;
