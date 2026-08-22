import { Suspense } from 'react';
import { CategoryNav, CategoryNavSkeleton } from '@/features/home/components/CategoryNav';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { PublicCatalog } from '@/features/catalog/types/catalog';

const EMPTY_CATALOG: PublicCatalog = {
  cities: [],
  propertyTypes: [],
  transactionTypes: [],
};

export async function CategoryNavBar() {
  let catalog = EMPTY_CATALOG;

  try {
    catalog = await catalogService.getPublicCatalog();
  } catch {
    return <CategoryNavSkeleton centered />;
  }

  if (
    catalog.transactionTypes.length === 0 &&
    catalog.propertyTypes.length === 0
  ) {
    return null;
  }

  return (
    <Suspense fallback={<CategoryNavSkeleton centered />}>
      <CategoryNav catalog={catalog} />
    </Suspense>
  );
}
