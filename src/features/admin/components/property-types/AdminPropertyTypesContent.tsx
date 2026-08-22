import { getAdminPropertyTypes } from '@/features/admin/services/admin-catalog-service';
import { AdminPropertyTypesPanel } from '@/features/admin/components/property-types/AdminPropertyTypesPanel';
import { PropertyTypeStatus } from '@/features/admin/types/catalog';

interface AdminPropertyTypesContentProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export async function AdminPropertyTypesContent({ searchParams }: AdminPropertyTypesContentProps) {
  const params = await searchParams;
  const status = params.status as PropertyTypeStatus | undefined;
  const search = params.search?.trim() || undefined;

  const items = await getAdminPropertyTypes({ status, search });

  return (
    <AdminPropertyTypesPanel
      initial={items}
      initialStatus={status}
      initialSearch={search ?? ''}
    />
  );
}
