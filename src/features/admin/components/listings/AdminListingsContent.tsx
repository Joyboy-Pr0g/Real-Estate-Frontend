import { getAdminListings } from '@/features/listings/services/admin-listings-service';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { getOfficeDetail } from '@/features/office/services/office-service';
import { getAdminIndividualListers } from '@/features/individual-lister/services/admin-individual-listers-service';
import { AdminListingsPanel } from '@/features/admin/components/listings/AdminListingsPanel';
import { PublicListing } from '@/features/listings/types/listing';

interface AdminListingsContentProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    property_type_id?: string;
    property_subtype_id?: string;
    transaction_type_id?: string;
    city_id?: string;
    neighborhood_id?: string;
    office_id?: string;
    individual_lister_id?: string;
    cursor?: string;
    include_deleted?: string;
  }>;
}

export async function AdminListingsContent({ searchParams }: AdminListingsContentProps) {
  const params = await searchParams;
  const status = params.status as PublicListing['status'] | undefined;
  const search = params.search?.trim() || undefined;
  const propertyTypeId = params.property_type_id || undefined;
  const propertySubtypeId = params.property_subtype_id || undefined;
  const transactionTypeId = params.transaction_type_id || undefined;
  const cityId = params.city_id || undefined;
  const neighborhoodId = params.neighborhood_id || undefined;
  const officeId = params.office_id || undefined;
  const individualListerId = params.individual_lister_id || undefined;
  const includeDeleted = params.include_deleted === 'true';

  const [page, catalog, initialSubtypes, initialNeighborhoods, officeDetail, individualListerPage] = await Promise.all([
    getAdminListings({
      status,
      search,
      property_type_id: propertyTypeId,
      property_subtype_id: propertySubtypeId,
      transaction_type_id: transactionTypeId,
      city_id: cityId,
      neighborhood_id: neighborhoodId,
      office_id: officeId,
      individual_lister_id: individualListerId,
      cursor: params.cursor,
      include_deleted: includeDeleted,
    }),
    catalogService.getPublicCatalog(),
    propertyTypeId ? catalogService.getPropertySubtypes(propertyTypeId) : Promise.resolve([]),
    cityId ? catalogService.getNeighborhoodsByCity(cityId) : Promise.resolve([]),
    officeId ? getOfficeDetail(officeId) : Promise.resolve(null),
    individualListerId ? getAdminIndividualListers({ id: individualListerId, limit: 1 }) : Promise.resolve(null),
  ]);

  const individualLister = individualListerPage?.items[0] ?? null;

  return (
    <AdminListingsPanel
      initial={page}
      propertyTypes={catalog.propertyTypes}
      transactionTypes={catalog.transactionTypes}
      cities={catalog.cities}
      initialSubtypes={initialSubtypes}
      initialNeighborhoods={initialNeighborhoods}
      initialStatus={status}
      initialSearch={search ?? ''}
      initialPropertyTypeId={propertyTypeId ?? ''}
      initialPropertySubtypeId={propertySubtypeId ?? ''}
      initialTransactionTypeId={transactionTypeId ?? ''}
      initialCityId={cityId ?? ''}
      initialNeighborhoodId={neighborhoodId ?? ''}
      initialOfficeId={officeId ?? ''}
      initialOfficeLabel={officeDetail?.name ?? ''}
      initialIndividualListerId={individualListerId ?? ''}
      initialIndividualListerLabel={
        individualLister?.user ? `${individualLister.user.f_name} ${individualLister.user.l_name}` : ''
      }
      initialIncludeDeleted={includeDeleted}
    />
  );
}
