import { getAdminCities } from '@/features/admin/services/admin-locations-service';
import { AdminCitiesPanel } from '@/features/admin/components/cities/AdminCitiesPanel';

interface AdminCitiesContentProps {
  searchParams: Promise<{ search?: string }>;
}

export async function AdminCitiesContent({ searchParams }: AdminCitiesContentProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const initial = await getAdminCities({ search });

  return <AdminCitiesPanel initial={initial} initialSearch={search ?? ''} />;
}
