import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import { StorefrontGateLayout } from '@/features/storefront/components/StorefrontGateLayout';

interface ComingSoonPageProps {
  settings: WebsiteSettings;
}

export function ComingSoonPage({ settings }: ComingSoonPageProps) {
  const message =
    settings.coming_soon_message?.trim() ||
    'منصة عقارات اليمن قادمة قريباً. ترقّبوا الإطلاق!';

  return (
    <StorefrontGateLayout
      settings={settings}
      variant="coming_soon"
      badge="قريباً"
      headline={settings.title}
      message={message}
      tone="brand"
    />
  );
}
