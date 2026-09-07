import { getAdminWebsiteSettingsServer } from '@/features/admin/services/admin-website-settings-service';
import { AdminWebsiteSettingsPanel } from '@/features/admin/components/website-settings/AdminWebsiteSettingsPanel';

export async function AdminWebsiteSettingsContent() {
  const settings = await getAdminWebsiteSettingsServer();
  return <AdminWebsiteSettingsPanel initialSettings={settings} />;
}
