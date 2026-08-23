import { listingService } from '@/features/listings/services/listing-service';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { MyListingsPanel } from '@/features/listings/components/dashboard/MyListingsPanel';

interface MyListingsContentProps {
  searchParams: Promise<{
    status?: string;
    property_type_id?: string;
    property_subtype_id?: string;
    transaction_type_id?: string;
    city_id?: string;
    neighborhood_id?: string;
  }>;
  basePath: string;
}

export async function MyListingsContent({ searchParams, basePath }: MyListingsContentProps) {
  const params = await searchParams;
  const propertyTypeId = params.property_type_id || undefined;
  const cityId = params.city_id || undefined;

  const [page, catalog, initialSubtypes, initialNeighborhoods] = await Promise.all([
    listingService.getMyListings({
      status: params.status,
      property_type_id: propertyTypeId,
      property_subtype_id: params.property_subtype_id || undefined,
      transaction_type_id: params.transaction_type_id || undefined,
      city_id: cityId,
      neighborhood_id: params.neighborhood_id || undefined,
      limit: 20,
    }),
    catalogService.getPublicCatalog(),
    propertyTypeId ? catalogService.getPropertySubtypes(propertyTypeId) : Promise.resolve([]),
    cityId ? catalogService.getNeighborhoodsByCity(cityId) : Promise.resolve([]),
  ]);

  return (
    <MyListingsPanel
      initialItems={page.items}
      initialCursor={page.next_cursor}
      initialHasMore={page.has_more}
      basePath={basePath}
      propertyTypes={catalog.propertyTypes}
      transactionTypes={catalog.transactionTypes}
      cities={catalog.cities}
      initialSubtypes={initialSubtypes}
      initialNeighborhoods={initialNeighborhoods}
    />
  );
}
