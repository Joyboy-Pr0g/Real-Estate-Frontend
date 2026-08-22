import { cookies } from 'next/headers';
import { ar, type TranslationKey } from './ar';
import { en } from './en';
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from './config';

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(LOCALE_COOKIE)?.value;
  return saved === 'en' || saved === 'ar' ? saved : DEFAULT_LOCALE;
}

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
