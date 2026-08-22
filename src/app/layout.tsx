import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { getServerLocale } from '@/lib/i18n/server';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const tajawal = Tajawal({
  variable: '--font-sans',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'عقارات اليمن | Real Estate Marketplace',
  description: 'اعثر على منزلك في اليمن — آلاف العقارات من مكاتب موثّقة',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const locale = await getServerLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      className={`${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <LocaleProvider locale={locale}>
          {children}
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
