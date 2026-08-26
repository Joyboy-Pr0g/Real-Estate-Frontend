import { listingService } from '@/features/listings/services/listing-service';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { MyListingsPanel } from '@/features/listings/components/dashboard/MyListingsPanel';
import { MyOffice } from '@/features/office/types/office';

interface MyListingsContentProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    property_type_id?: string;
    property_subtype_id?: string;
    transaction_type_id?: string;
    city_id?: string;
    neighborhood_id?: string;
    office_id?: string;
  }>;
  basePath: string;
  enableOfficeFilter?: boolean;
  myOffices?: MyOffice[];
}

export async function MyListingsContent({
  searchParams,
  basePath,
  enableOfficeFilter = false,
  myOffices = [],
}: MyListingsContentProps) {
  const params = await searchParams;
  const propertyTypeId = params.property_type_id || undefined;
  const cityId = params.city_id || undefined;
  const officeId = params.office_id || undefined;

  const selectedOffice = officeId ? myOffices.find((office) => office.id === officeId) : null;

  const [page, catalog, initialSubtypes, initialNeighborhoods] = await Promise.all([
    listingService.getMyListings({
      status: params.status,
      search: params.search?.trim() || undefined,
      property_type_id: propertyTypeId,
      property_subtype_id: params.property_subtype_id || undefined,
      transaction_type_id: params.transaction_type_id || undefined,
      city_id: cityId,
      neighborhood_id: params.neighborhood_id || undefined,
      office_id: officeId,
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
      initialSearch={params.search?.trim() ?? ''}
      enableOfficeFilter={enableOfficeFilter}
      myOffices={myOffices}
      initialOfficeId={officeId ?? ''}
      initialOfficeLabel={selectedOffice?.name ?? ''}
    />
  );
}
