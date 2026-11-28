export const LOCALE_COOKIE = 're-locale';
export const DEFAULT_LOCALE = 'ar' as const;
export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return value === 'ar' || value === 'en';
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export const localeLabels: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};
