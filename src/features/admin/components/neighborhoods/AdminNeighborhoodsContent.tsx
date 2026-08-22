import {
  getAdminNeighborhoods,
  getPublicCitiesForAdmin,
} from '@/features/admin/services/admin-locations-service';
import { AdminNeighborhoodsPanel } from '@/features/admin/components/neighborhoods/AdminNeighborhoodsPanel';

interface AdminNeighborhoodsContentProps {
  searchParams: Promise<{ search?: string; city_id?: string }>;
}

export async function AdminNeighborhoodsContent({ searchParams }: AdminNeighborhoodsContentProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const cityId = params.city_id || undefined;

  const [initial, cities] = await Promise.all([
    getAdminNeighborhoods({ search, city_id: cityId }),
    getPublicCitiesForAdmin(),
  ]);

  return (
    <AdminNeighborhoodsPanel
      initial={initial}
      cities={cities}
      initialSearch={search ?? ''}
      initialCityId={cityId ?? ''}
    />
  );
}
