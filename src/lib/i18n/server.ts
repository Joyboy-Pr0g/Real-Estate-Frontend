import { cache } from 'react';
import { locale as localeParam } from 'next/root-params';
import { ar, type TranslationKey } from './ar';
import { en } from './en';
import { resolveLocale, type Locale } from './config';

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export const getServerLocale = cache(async (): Promise<Locale> => resolveLocale(await localeParam()));

export async function getServerTranslations() {
  const locale = await getServerLocale();
  const dictionary = locale === 'ar' ? ar : en;

  return {
    locale,
    dir: locale === 'ar' ? ('rtl' as const) : ('ltr' as const),
    t: (key: TranslationKey, params?: Record<string, string | number>) =>
      interpolate(dictionary[key], params),
  };
}
