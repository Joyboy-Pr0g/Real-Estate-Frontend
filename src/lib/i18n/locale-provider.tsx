'use client';

import { createContext, useContext, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ar, type TranslationKey } from './ar';
import { en } from './en';
import { LOCALE_COOKIE, type Locale } from './config';

interface LocaleContextValue {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const value = useMemo<LocaleContextValue>(() => {
    const dictionary = locale === 'ar' ? ar : en;
    return {
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      t: (key: TranslationKey) => dictionary[key],
      setLocale: (next: Locale) => {
        document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
        startTransition(() => router.refresh());
      },
    };
  }, [locale, router]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
