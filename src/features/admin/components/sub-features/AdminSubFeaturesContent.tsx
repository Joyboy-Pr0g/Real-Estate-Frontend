import {
  getAdminMainFeatures,
  getAdminSubFeatures,
} from '@/features/admin/services/admin-features-service';
import { AdminSubFeaturesPanel } from '@/features/admin/components/sub-features/AdminSubFeaturesPanel';

interface AdminSubFeaturesContentProps {
  searchParams: Promise<{ main_feature_id?: string }>;
}

export async function AdminSubFeaturesContent({ searchParams }: AdminSubFeaturesContentProps) {
  const params = await searchParams;
  const mainFeatureId = params.main_feature_id || undefined;

  const [mainFeatures, initial] = await Promise.all([
    getAdminMainFeatures(),
    getAdminSubFeatures({ main_feature_id: mainFeatureId }),
  ]);

  return (
    <AdminSubFeaturesPanel
      initial={initial}
      mainFeatures={mainFeatures}
      initialMainFeatureId={mainFeatureId ?? ''}
    />
  );
}
