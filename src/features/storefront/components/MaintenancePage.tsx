import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import { StorefrontGateLayout } from '@/features/storefront/components/StorefrontGateLayout';

interface MaintenancePageProps {
  settings: WebsiteSettings;
}

export function MaintenancePage({ settings }: MaintenancePageProps) {
  const badge = settings.maintenance_title?.trim() || 'الصيانة جارية';
  const message =
    settings.maintenance_message?.trim() ||
    'نعتذر عن الإزعاج. نعمل حالياً على تحسين المنصة لتقديم تجربة أفضل. يرجى المحاولة لاحقاً.';

  return (
    <StorefrontGateLayout
      settings={settings}
      variant="maintenance"
      badge={badge}
      headline="نعتذر عن الإزعاج"
      message={message}
      tone="amber"
    />
  );
}
