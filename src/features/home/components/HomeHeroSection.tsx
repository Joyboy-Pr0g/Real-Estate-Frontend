import { HomeHero } from '@/features/home/components/HomeHero';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { PublicCatalog } from '@/features/catalog/types/catalog';

const EMPTY_CATALOG: PublicCatalog = {
  cities: [],
  propertyTypes: [],
  transactionTypes: [],
};

export async function HomeHeroSection() {
  let catalog = EMPTY_CATALOG;

  try {
    catalog = await catalogService.getPublicCatalog();
  } catch {
    // Search pill still renders; panels will show empty lists
  }

  return <HomeHero catalog={catalog} />;
}
