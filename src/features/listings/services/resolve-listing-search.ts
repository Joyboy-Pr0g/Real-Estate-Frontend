import { catalogService } from '@/features/catalog/services/catalog-service';
import { catalogLookupService } from '@/features/listings/services/catalog-lookup-service';
import { parseSpecFromRecord } from '@/features/listings/lib/spec-url';
import { ListingSearchQuery } from '@/features/listings/schemas/search-schema';
import { ListingSearchUrlParams } from '@/features/listings/types/listing-search-url';

export async function resolveListingSearchParams(
  params: ListingSearchUrlParams,
): Promise<ListingSearchQuery> {
  const catalog = await catalogService.getPublicCatalog();
  const spec = parseSpecFromRecord(params as Record<string, string | undefined>);

  const [
    propertyType,
    transactionType,
    propertySubtype,
    city,
    neighborhood,
  ] = await Promise.all([
    params.property_type
      ? catalog.propertyTypes.find((item) => item.slug === params.property_type)
        ?? catalogLookupService.getPropertyTypeBySlug(params.property_type)
      : Promise.resolve(null),
    params.transaction_type
      ? catalog.transactionTypes.find((item) => item.slug === params.transaction_type)
        ?? catalogLookupService.getTransactionTypeBySlug(params.transaction_type)
      : Promise.resolve(null),
    params.property_subtype
      ? catalogLookupService.getPropertySubtypeBySlug(params.property_subtype)
      : Promise.resolve(null),
    params.city
      ? catalog.cities.find((item) => item.pcode === params.city)
        ?? catalogLookupService.getCityByPcode(params.city)
      : Promise.resolve(null),
    params.neighborhood
      && params.neighborhood !== 'undefined'
      ? catalogLookupService.getNeighborhoodByPcode(params.neighborhood)
      : Promise.resolve(null),
  ]);

  return {
    ...(propertyType ? { property_type_id: propertyType.id } : {}),
    ...(transactionType ? { transaction_type_id: transactionType.id } : {}),
    ...(propertySubtype ? { property_subtype_id: propertySubtype.id } : {}),
    ...(city ? { city_id: city.id } : {}),
    ...(neighborhood ? { neighborhood_id: neighborhood.id } : {}),
    ...(params.min_price ? { min_price: params.min_price } : {}),
    ...(params.max_price ? { max_price: params.max_price } : {}),
    ...(params.sort
      ? {
          sort: params.sort as ListingSearchQuery['sort'],
        }
      : {}),
    ...(params.cursor ? { cursor: params.cursor } : {}),
    ...(params.limit ? { limit: Number(params.limit) } : {}),
    ...(Object.keys(spec).length > 0 ? { spec } : {}),
  };
}
