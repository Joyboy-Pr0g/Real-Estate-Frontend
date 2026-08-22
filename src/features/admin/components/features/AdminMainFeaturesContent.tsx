import { getAdminMainFeatures } from '@/features/admin/services/admin-features-service';
import { AdminMainFeaturesPanel } from '@/features/admin/components/features/AdminMainFeaturesPanel';

export async function AdminMainFeaturesContent() {
  const initial = await getAdminMainFeatures();
  return <AdminMainFeaturesPanel initial={initial} />;
}
