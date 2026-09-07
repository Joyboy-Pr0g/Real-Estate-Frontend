import { Suspense } from 'react';
import { SiteHeader } from '@/features/layout/components/SiteHeader';
import { SiteFooter } from '@/features/layout/components/SiteFooter';
import { CategoryNavBar } from '@/features/home/components/CategoryNavBar';
import { CategoryNavSkeleton } from '@/features/home/components/CategoryNav';
import { SiteHeaderOverrideProvider } from '@/features/layout/context/site-header-override';
import { getSession } from '@/lib/auth/session';
import { MessagingSocketProvider } from '@/features/messaging/providers/MessagingSocketProvider';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { ComingSoonPage } from '@/features/storefront/components/ComingSoonPage';
import { MaintenancePage } from '@/features/storefront/components/MaintenancePage';

export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings] = await Promise.all([getSession(), getWebsiteSettingsServer()]);

  if (settings.storefront_mode === 'maintenance') {
    return <MaintenancePage settings={settings} />;
  }

  if (settings.storefront_mode === 'coming_soon') {
    return <ComingSoonPage settings={settings} />;
  }

  const content = (
    <SiteHeaderOverrideProvider>
      <SiteHeader
        user={user}
        settings={settings}
        categoryNav={
          <Suspense fallback={<CategoryNavSkeleton centered />}>
            <CategoryNavBar />
          </Suspense>
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </SiteHeaderOverrideProvider>
  );

  if (!user) return content;

  return <MessagingSocketProvider enabled>{content}</MessagingSocketProvider>;
}
