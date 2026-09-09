import type { Metadata, Viewport } from 'next';
import { getRootMetadata, getRootOrganizationSchema, getRootViewport } from '@/lib/seo/metadata';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { Tajawal } from 'next/font/google';
import { getServerLocale } from '@/lib/i18n/server';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/lib/query/provider';
import './globals.css';

const tajawal = Tajawal({
  variable: '--font-sans',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  return getRootMetadata();
}

export async function generateViewport(): Promise<Viewport> {
  return getRootViewport();
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
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
