'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Globe,
  ImageIcon,
  Link2,
  Mail,
  Phone,
  Search,
  Settings,
  Trash2,
  ToggleLeft,
} from 'lucide-react';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/admin-page-header';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import {
  createWebsiteSettingsSchema,
  type WebsiteSettingsFormValues,
} from '@/features/admin/schemas/website-settings-schema';
import { updateAdminWebsiteSettings } from '@/features/admin/services/admin-website-settings-client';

interface AdminWebsiteSettingsPanelProps {
  initialSettings: WebsiteSettings;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

const textareaClass =
  'w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-brand/40 focus:bg-white';

function toFormValues(settings: WebsiteSettings): WebsiteSettingsFormValues {
  return {
    title: settings.title,
    website_email: settings.website_email ?? '',
    website_phone: settings.website_phone ?? '',
    support_email: settings.support_email ?? '',
    legal_entity_name: settings.legal_entity_name ?? '',
    address_text: settings.address_text ?? '',
    facebook: settings.facebook ?? '',
    instagram: settings.instagram ?? '',
    whatsapp: settings.whatsapp ?? '',
    tiktok: settings.tiktok ?? '',
    description: settings.description ?? '',
    meta_title: settings.meta_title ?? '',
    meta_description: settings.meta_description ?? '',
    meta_keywords: settings.meta_keywords ?? '',
    site_url: settings.site_url ?? '',
    twitter_card: (settings.twitter_card as 'summary' | 'summary_large_image') ?? 'summary_large_image',
    twitter_handle: settings.twitter_handle ?? '',
    default_locale: settings.default_locale ?? 'ar_YE',
    theme_color: settings.theme_color ?? '#1e6b45',
    robots: settings.robots ?? 'index, follow',
    google_site_verification: settings.google_site_verification ?? '',
    google_analytics_id: settings.google_analytics_id ?? '',
    facebook_domain_verification: settings.facebook_domain_verification ?? '',
    index_listing_search_pages: settings.index_listing_search_pages ?? false,
    index_office_profiles: settings.index_office_profiles ?? true,
    allow_public_indexing: settings.allow_public_indexing ?? true,
    remove_header_logo: false,
    remove_footer_logo: false,
    remove_favicon: false,
    remove_og_image: false,
    remove_default_listing_og_fallback: false,
  };
}

type RemoveField =
  | 'remove_header_logo'
  | 'remove_footer_logo'
  | 'remove_favicon'
  | 'remove_og_image'
  | 'remove_default_listing_og_fallback';

export function AdminWebsiteSettingsPanel({ initialSettings }: AdminWebsiteSettingsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [footerFile, setFooterFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [listingOgFallbackFile, setListingOgFallbackFile] = useState<File | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [footerPreview, setFooterPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [listingOgFallbackPreview, setListingOgFallbackPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const websiteSettingsSchema = useMemo(() => createWebsiteSettingsSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WebsiteSettingsFormValues>({
    resolver: zodResolver(websiteSettingsSchema),
    defaultValues: toFormValues(initialSettings),
  });

  const [prevInitial, setPrevInitial] = useState(initialSettings);
  if (initialSettings !== prevInitial) {
    setPrevInitial(initialSettings);
    setSettings(initialSettings);
    reset(toFormValues(initialSettings));
    setHeaderFile(null);
    setFooterFile(null);
    setFaviconFile(null);
    setOgImageFile(null);
    setListingOgFallbackFile(null);
    setHeaderPreview(null);
    setFooterPreview(null);
    setFaviconPreview(null);
    setOgImagePreview(null);
    setListingOgFallbackPreview(null);
  }

  const removeHeaderLogo = watch('remove_header_logo');
  const removeFooterLogo = watch('remove_footer_logo');
  const removeFavicon = watch('remove_favicon');
  const removeOgImage = watch('remove_og_image');
  const removeListingOgFallback = watch('remove_default_listing_og_fallback');

  const handleAssetChange = (
    file: File | null,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void,
    removeField: RemoveField,
  ) => {
    setFile(file);
    setValue(removeField, false);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const appendOptional = (formData: FormData, key: string, value?: string | null) => {
    formData.append(key, value?.trim() ?? '');
  };

  const onSubmit = async (values: WebsiteSettingsFormValues) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      appendOptional(formData, 'website_email', values.website_email);
      appendOptional(formData, 'website_phone', values.website_phone);
      appendOptional(formData, 'support_email', values.support_email);
      appendOptional(formData, 'legal_entity_name', values.legal_entity_name);
      appendOptional(formData, 'address_text', values.address_text);
      appendOptional(formData, 'facebook', values.facebook);
      appendOptional(formData, 'instagram', values.instagram);
      appendOptional(formData, 'whatsapp', values.whatsapp);
      appendOptional(formData, 'tiktok', values.tiktok);
      appendOptional(formData, 'description', values.description);
      appendOptional(formData, 'meta_title', values.meta_title);
      appendOptional(formData, 'meta_description', values.meta_description);
      appendOptional(formData, 'meta_keywords', values.meta_keywords);
      appendOptional(formData, 'site_url', values.site_url);
      formData.append('twitter_card', values.twitter_card ?? 'summary_large_image');
      appendOptional(formData, 'twitter_handle', values.twitter_handle);
      appendOptional(formData, 'default_locale', values.default_locale);
      appendOptional(formData, 'theme_color', values.theme_color);
      appendOptional(formData, 'robots', values.robots);
      appendOptional(formData, 'google_site_verification', values.google_site_verification);
      appendOptional(formData, 'google_analytics_id', values.google_analytics_id);
      appendOptional(formData, 'facebook_domain_verification', values.facebook_domain_verification);
      formData.append('index_listing_search_pages', String(values.index_listing_search_pages ?? false));
      formData.append('index_office_profiles', String(values.index_office_profiles ?? true));
      formData.append('allow_public_indexing', String(values.allow_public_indexing ?? true));
      formData.append('remove_header_logo', String(values.remove_header_logo ?? false));
      formData.append('remove_footer_logo', String(values.remove_footer_logo ?? false));
      formData.append('remove_favicon', String(values.remove_favicon ?? false));
      formData.append('remove_og_image', String(values.remove_og_image ?? false));
      formData.append(
        'remove_default_listing_og_fallback',
        String(values.remove_default_listing_og_fallback ?? false),
      );
      if (headerFile) formData.append('header_logo', headerFile);
      if (footerFile) formData.append('footer_logo', footerFile);
      if (faviconFile) formData.append('favicon', faviconFile);
      if (ogImageFile) formData.append('og_image', ogImageFile);
      if (listingOgFallbackFile) formData.append('default_listing_og_fallback', listingOgFallbackFile);

      const updated = await updateAdminWebsiteSettings(formData);
      setSettings(updated);
      reset(toFormValues(updated));
      setHeaderFile(null);
      setFooterFile(null);
      setFaviconFile(null);
      setOgImageFile(null);
      setListingOgFallbackFile(null);
      setHeaderPreview(null);
      setFooterPreview(null);
      setFaviconPreview(null);
      setOgImagePreview(null);
      setListingOgFallbackPreview(null);
      toast.success(t('admin.websiteSettings.updated'));
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const renderImageField = (
    label: string,
    hint: string | undefined,
    currentUrl: string | null,
    preview: string | null,
    removeField: RemoveField,
    removeValue: boolean | undefined,
    onFileChange: (file: File | null) => void,
    inputId: string,
    accept = 'image/jpeg,image/png,image/webp,image/x-icon,image/vnd.microsoft.icon',
  ) => {
    const displayUrl = removeValue ? null : preview ?? currentUrl;

    return (
      <div className="space-y-3">
        <div>
          <label htmlFor={inputId} className="text-sm font-medium text-primary-dark">
            {label}
          </label>
          {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:w-40">
            {displayUrl ? (
              <img src={displayUrl} alt={label} className="h-full w-full object-contain p-2" />
            ) : (
              <ImageIcon className="h-7 w-7 text-gray-300" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <input
              id={inputId}
              type="file"
              accept={accept}
              className={fieldClass}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFileChange(e.target.files?.[0] ?? null)}
            />
            {currentUrl && !removeValue ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit rounded-xl"
                onClick={() => setValue(removeField, true)}
              >
                <Trash2 className="me-1 h-3.5 w-3.5" />
                {t('admin.websiteSettings.removeImage')}
              </Button>
            ) : null}
            {removeValue ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit rounded-xl"
                onClick={() => setValue(removeField, false)}
              >
                {t('admin.websiteSettings.undo')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const sectionClass = 'space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6';

  return (
    <div className={cn('space-y-6', submitting && 'opacity-60')}>
      <AdminPageHeader
        breadcrumbItems={[
          { labelKey: 'admin.breadcrumbRoot', href: '/admin' },
          { labelKey: 'admin.websiteSettings.title', icon: Settings },
        ]}
        title={t('admin.websiteSettings.title')}
        countLabel={settings.title}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl space-y-6">
        <section className={sectionClass}>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-primary-dark">{t('admin.websiteSettings.general')}</h2>
          </div>
          <div className="space-y-2">
            <label htmlFor="title">{t('admin.websiteSettings.siteTitle')}</label>
            <input id="title" className={fieldClass} {...register('title')} />
            {errors.title ? <p className="text-sm text-red-600">{errors.title.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="description">{t('admin.websiteSettings.siteDescription')}</label>
            <textarea id="description" rows={4} className={textareaClass} {...register('description')} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="legal_entity_name">{t('admin.websiteSettings.legalEntity')}</label>
              <input id="legal_entity_name" className={fieldClass} {...register('legal_entity_name')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="address_text">{t('admin.websiteSettings.address')}</label>
              <textarea id="address_text" rows={2} className={textareaClass} {...register('address_text')} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-primary-dark">{t('admin.websiteSettings.seo')}</h2>
          </div>
          <p className="text-sm text-gray-500">{t('admin.websiteSettings.seoHint')}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="site_url">{t('admin.websiteSettings.siteUrl')}</label>
              <input id="site_url" className={fieldClass} placeholder="https://aqarat-yemen.com" {...register('site_url')} />
              {errors.site_url ? <p className="text-sm text-red-600">{errors.site_url.message}</p> : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="meta_title">{t('admin.websiteSettings.metaTitle')}</label>
              <input id="meta_title" className={fieldClass} {...register('meta_title')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="meta_description">{t('admin.websiteSettings.metaDescription')}</label>
              <textarea id="meta_description" rows={3} className={textareaClass} {...register('meta_description')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="meta_keywords">{t('admin.websiteSettings.metaKeywords')}</label>
              <input id="meta_keywords" className={fieldClass} {...register('meta_keywords')} />
            </div>
            <div className="space-y-2">
              <label htmlFor="default_locale">{t('admin.websiteSettings.defaultLocale')}</label>
              <input id="default_locale" className={fieldClass} placeholder="ar_YE" {...register('default_locale')} />
            </div>
            <div className="space-y-2">
              <label htmlFor="theme_color">{t('admin.websiteSettings.themeColor')}</label>
              <input id="theme_color" className={fieldClass} placeholder="#1e6b45" {...register('theme_color')} />
            </div>
            <div className="space-y-2">
              <label htmlFor="robots">{t('admin.websiteSettings.robots')}</label>
              <input id="robots" className={fieldClass} placeholder="index, follow" {...register('robots')} />
            </div>
            <div className="space-y-2">
              <label htmlFor="twitter_card">{t('admin.websiteSettings.twitterCard')}</label>
              <select id="twitter_card" className={fieldClass} {...register('twitter_card')}>
                <option value="summary_large_image">{t('admin.websiteSettings.twitterCardLarge')}</option>
                <option value="summary">{t('admin.websiteSettings.twitterCardSummary')}</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="twitter_handle">{t('admin.websiteSettings.twitterHandle')}</label>
              <input id="twitter_handle" className={fieldClass} placeholder="@aqarat-yemen" {...register('twitter_handle')} />
            </div>
          </div>
          {renderImageField(
            t('admin.websiteSettings.favicon'),
            t('admin.websiteSettings.faviconHint'),
            settings.favicon_url,
            faviconPreview,
            'remove_favicon',
            removeFavicon,
            (file) => handleAssetChange(file, setFaviconFile, setFaviconPreview, 'remove_favicon'),
            'favicon',
          )}
          {renderImageField(
            t('admin.websiteSettings.ogImage'),
            t('admin.websiteSettings.ogImageHint'),
            settings.og_image_url,
            ogImagePreview,
            'remove_og_image',
            removeOgImage,
            (file) => handleAssetChange(file, setOgImageFile, setOgImagePreview, 'remove_og_image'),
            'og_image',
          )}
          {renderImageField(
            t('admin.websiteSettings.listingOgFallback'),
            t('admin.websiteSettings.listingOgFallbackHint'),
            settings.default_listing_og_fallback_url,
            listingOgFallbackPreview,
            'remove_default_listing_og_fallback',
            removeListingOgFallback,
            (file) =>
              handleAssetChange(
                file,
                setListingOgFallbackFile,
                setListingOgFallbackPreview,
                'remove_default_listing_og_fallback',
              ),
            'default_listing_og_fallback',
          )}
        </section>

        <section className={sectionClass}>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-primary-dark">{t('admin.websiteSettings.contact')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="website_email">{t('admin.websiteSettings.email')}</label>
              <input id="website_email" type="email" className={fieldClass} {...register('website_email')} />
              {errors.website_email ? <p className="text-sm text-red-600">{errors.website_email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="support_email">{t('admin.websiteSettings.supportEmail')}</label>
              <input id="support_email" type="email" className={fieldClass} {...register('support_email')} />
              {errors.support_email ? <p className="text-sm text-red-600">{errors.support_email.message}</p> : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="website_phone">{t('admin.websiteSettings.phone')}</label>
              <div className="relative">
                <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input id="website_phone" className={cn(fieldClass, 'ps-9')} {...register('website_phone')} />
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-primary-dark">{t('admin.websiteSettings.logos')}</h2>
          </div>
          {renderImageField(
            t('admin.websiteSettings.headerLogo'),
            undefined,
            settings.header_logo_url,
            headerPreview,
            'remove_header_logo',
            removeHeaderLogo,
            (file) => handleAssetChange(file, setHeaderFile, setHeaderPreview, 'remove_header_logo'),
            'header_logo',
          )}
          {renderImageField(
            t('admin.websiteSettings.footerLogo'),
            undefined,
            settings.footer_logo_url,
            footerPreview,
            'remove_footer_logo',
            removeFooterLogo,
            (file) => handleAssetChange(file, setFooterFile, setFooterPreview, 'remove_footer_logo'),
            'footer_logo',
          )}
        </section>

        <section className={sectionClass}>
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-primary-dark">{t('admin.websiteSettings.social')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="facebook">{t('admin.websiteSettings.facebook')}</label>
              <input id="facebook" className={fieldClass} {...register('facebook')} />
            </div>
            <div className="space-y-2">
              <label htmlFor="instagram">{t('admin.websiteSettings.instagram')}</label>
              <input id="instagram" className={fieldClass} {...register('instagram')} />
            </div>
            <div className="space-y-2">
              <label htmlFor="whatsapp">{t('admin.websiteSettings.whatsapp')}</label>
              <input id="whatsapp" className={fieldClass} {...register('whatsapp')} />
            </div>
            <div className="space-y-2">
              <label htmlFor="tiktok">{t('admin.websiteSettings.tiktok')}</label>
              <input id="tiktok" className={fieldClass} {...register('tiktok')} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-primary-dark">{t('admin.websiteSettings.integrations')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="google_site_verification">{t('admin.websiteSettings.googleVerification')}</label>
              <input id="google_site_verification" className={fieldClass} {...register('google_site_verification')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="google_analytics_id">{t('admin.websiteSettings.googleAnalytics')}</label>
              <input id="google_analytics_id" className={fieldClass} placeholder="G-XXXXXXXXXX" {...register('google_analytics_id')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="facebook_domain_verification">{t('admin.websiteSettings.facebookVerification')}</label>
              <input id="facebook_domain_verification" className={fieldClass} {...register('facebook_domain_verification')} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-primary-dark">{t('admin.websiteSettings.indexing')}</h2>
          </div>
          <p className="text-sm text-gray-500">{t('admin.websiteSettings.indexingHint')}</p>
          <div className="space-y-3">
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
              <input type="checkbox" className="mt-1" {...register('allow_public_indexing')} />
              <span>
                <span className="block text-sm font-medium text-primary-dark">
                  {t('admin.websiteSettings.allowPublicIndexing')}
                </span>
                <span className="text-xs text-gray-500">{t('admin.websiteSettings.allowPublicIndexingHint')}</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
              <input type="checkbox" className="mt-1" {...register('index_listing_search_pages')} />
              <span>
                <span className="block text-sm font-medium text-primary-dark">
                  {t('admin.websiteSettings.indexListingSearch')}
                </span>
                <span className="text-xs text-gray-500">{t('admin.websiteSettings.indexListingSearchHint')}</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
              <input type="checkbox" className="mt-1" {...register('index_office_profiles')} />
              <span>
                <span className="block text-sm font-medium text-primary-dark">
                  {t('admin.websiteSettings.indexOfficeProfiles')}
                </span>
                <span className="text-xs text-gray-500">{t('admin.websiteSettings.indexOfficeProfilesHint')}</span>
              </span>
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="rounded-xl">
            {submitting ? t('admin.websiteSettings.saving') : t('admin.websiteSettings.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
