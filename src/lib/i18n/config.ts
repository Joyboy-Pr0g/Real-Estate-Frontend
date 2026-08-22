export const LOCALE_COOKIE = 're-locale';
export const DEFAULT_LOCALE = 'ar' as const;
export type Locale = 'ar' | 'en';

export const localeLabels: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};
