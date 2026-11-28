import type { Metadata, Viewport } from 'next';
import { getRootMetadata, getRootOrganizationSchema, getRootViewport } from '@/lib/seo/metadata';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { Tajawal } from 'next/font/google';
import { getServerLocale } from '@/lib/i18n/server';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/lib/query/provider';
import { notFound } from 'next/navigation';
import { LOCALES, isLocale } from '@/lib/i18n/config';
import '../globals.css';

const tajawal = Tajawal({
  variable: '--font-sans',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Tajawal Arabic Fallback', 'Tajawal Latin Fallback'],
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  return getRootMetadata();
}

export async function generateViewport(): Promise<Viewport> {
  return getRootViewport();
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = await getServerLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const organizationSchema = await getRootOrganizationSchema();

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      className={`${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <JsonLdScript data={organizationSchema} />
        <LocaleProvider locale={locale}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
