import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { AboutPageShowcase } from '@/features/about/components/AboutPageShowcase';
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
        <AboutPageShowcase settings={settings} />
      </Container>
    </div>
  );
}
