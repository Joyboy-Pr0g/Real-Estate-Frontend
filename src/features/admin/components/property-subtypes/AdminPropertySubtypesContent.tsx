import {
  getAdminPropertySubtypes,
  getAdminPropertyTypes,
} from '@/features/admin/services/admin-catalog-service';
import { AdminPropertySubtypesPanel } from '@/features/admin/components/property-subtypes/AdminPropertySubtypesPanel';

interface AdminPropertySubtypesContentProps {
  searchParams: Promise<{
    search?: string;
    property_type_id?: string;
  }>;
}

export async function AdminPropertySubtypesContent({ searchParams }: AdminPropertySubtypesContentProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const propertyTypeId = params.property_type_id || undefined;

  const [items, propertyTypes] = await Promise.all([
    getAdminPropertySubtypes({ search, property_type_id: propertyTypeId }),
    getAdminPropertyTypes(),
  ]);

  return (
    <AdminPropertySubtypesPanel
      initial={items}
      propertyTypes={propertyTypes}
      initialSearch={search ?? ''}
      initialPropertyTypeId={propertyTypeId ?? ''}
    />
  );
}
