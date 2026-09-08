import { Container } from '@/components/ui/container';
import { HomeSeoShowcase } from '@/features/home/components/HomeSeoShowcase';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';

export async function HomeSeoContent() {
  const settings = await getWebsiteSettingsServer();

  return (
    <section
      className="border-t border-gray-100 bg-gradient-to-b from-gray-50/90 to-white py-12 md:py-16"
      aria-labelledby="home-seo-heading"
    >
      <Container>
        <HomeSeoShowcase settings={settings} />
      </Container>
    </section>
  );
}
