import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { formatWhatsappLink, withWebsiteSettingsDefaults } from '@/lib/website-settings/defaults';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'تواصل معنا',
    description: 'تواصل معنا للحصول على الدعم أو الأسئلة المتعلقة بالتحقق من مكتب العقارات أو الاستفسارات حول الشركة.',
    path: '/contact',
  });
}

export default async function ContactPage() {
  const settings = withWebsiteSettingsDefaults(await getWebsiteSettingsServer());

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark lg:text-4xl"> تواصل معنا</h1>
            <p className="mt-3 text-base text-gray-600">
              تواصل مع فريق {settings.title} للحصول على الدعم، أسئلة التحقق من مكتب العقارات، أو الاستفسارات حول الشركة.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-var(--shadow-soft)">
            {settings.website_phone ? (
              <p className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-brand" />
                <a href={`tel:${settings.website_phone.replace(/\s/g, '')}`} className="hover:text-brand">
                  {settings.website_phone}
                </a>
              </p>
            ) : null}
            {settings.website_email ? (
              <p className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-brand" />
                <a href={`mailto:${settings.website_email}`} className="hover:text-brand">
                  {settings.website_email}
                </a>
              </p>
            ) : null}
            {settings.support_email && settings.support_email !== settings.website_email ? (
              <p className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-brand" />
                <a href={`mailto:${settings.support_email}`} className="hover:text-brand">
                  {settings.support_email}
                </a>
              </p>
            ) : null}
            {settings.whatsapp ? (
              <p className="text-sm">
                <a
                  href={formatWhatsappLink(settings.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand hover:underline"
                >
                  دعم WhatsApp
                </a>
              </p>
            ) : null}
            {settings.address_text ? (
              <p className="flex items-start gap-3 text-sm text-gray-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {settings.address_text}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-brand hover:underline">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="text-brand hover:underline">
              شروط الخدمة
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
