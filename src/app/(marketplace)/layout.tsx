import { SiteHeader } from '@/features/layout/components/SiteHeader';
import { SiteFooter } from '@/features/layout/components/SiteFooter';
import { SiteHeaderOverrideProvider } from '@/features/layout/context/site-header-override';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { ComingSoonPage } from '@/features/storefront/components/ComingSoonPage';
import { MaintenancePage } from '@/features/storefront/components/MaintenancePage';
import { StorefrontProviders } from '@/features/storefront/components/StorefrontProviders';

export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getWebsiteSettingsServer();

  if (settings.storefront_mode === 'maintenance') {
    return <MaintenancePage settings={settings} />;
  }

  if (settings.storefront_mode === 'coming_soon') {
    return <ComingSoonPage settings={settings} />;
  }

  return (
    <StorefrontProviders>
      <SiteHeaderOverrideProvider>
        <SiteHeader settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
      </SiteHeaderOverrideProvider>
    </StorefrontProviders>
  );
}
