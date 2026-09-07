import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { withWebsiteSettingsDefaults } from '@/lib/website-settings/defaults';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'عن الموقع',
    path: '/about',
    description: 'عن الموقع والخدمات التي يقدمها للمستخدمين.',
  });
}

export default async function AboutPage() {
  const settings = withWebsiteSettingsDefaults(await getWebsiteSettingsServer());

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-3xl font-bold text-primary-dark lg:text-4xl">{settings.title}</h1>
          <p className="text-base leading-relaxed text-gray-600">{settings.description}</p>
          <p className="text-sm leading-relaxed text-gray-600">
            نحن نوصل بين المشترين والمستأجرين بمكاتب العقارات المعتمدة والمستأجرين الفرديين في اليمن.
            ابحث بالمدينة، نوع العقار، والميزانية؛ قارن القوائم؛ وأرسل رسالة مباشرة إلى البائعين عبر منصتنا.
          </p>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
            {settings.legal_entity_name ? (
              <p className="font-medium text-primary-dark">{settings.legal_entity_name}</p>
            ) : null}
            {settings.address_text ? (
              <p className="mt-2 flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {settings.address_text}
              </p>
            ) : null}
          </div>
          <Link href="/contact" className="inline-flex text-sm font-medium text-brand hover:underline">
            تواصل معنا
          </Link>
        </div>
      </Container>
    </div>
  );
}
