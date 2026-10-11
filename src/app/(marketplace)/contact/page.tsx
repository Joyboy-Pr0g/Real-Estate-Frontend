import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { ContactForm } from '@/features/contact/components/ContactForm';
import { ContactInfoCards } from '@/features/contact/components/ContactInfoCards';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getServerTranslations } from '@/lib/i18n/server';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { withWebsiteSettingsDefaults } from '@/lib/website-settings/defaults';
import { getSession } from '@/lib/auth/session';
import { ContactHeader } from '@/features/contact/components/ContactHeader';
import { ContactSchedule } from '@/features/contact/components/ContactSchedule';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerTranslations();
  return getPageMetadataFromSettings(
    {
      title: t('seo.page.contact'),
      description: t('home.seo.metaDescription'),
      path: '/contact',
    },
    locale,
  );
}

export default async function ContactPage() {
  const settings = withWebsiteSettingsDefaults(await getWebsiteSettingsServer());
  const user = (await getSession())!;

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mx-auto max-w-5xl space-y-10">
          <ContactHeader title={settings.title} />

          <ContactInfoCards settings={settings} />

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ContactForm user={user} />
            <ContactSchedule />
          </div>
        </div>
      </Container>
    </div>
  );
}
