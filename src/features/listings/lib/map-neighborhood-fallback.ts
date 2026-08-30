import {
  CITY_BOUNDARY_RADIUS_KM,
  NEIGHBORHOOD_BOUNDARY_RADIUS_KM,
} from '@/features/listings/constants/map-config';
import type { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import type { PublicCity } from '@/features/catalog/types/catalog';
import {
  buildBoundaryCollection,
  type MapBoundaryKind,
} from '@/features/listings/lib/map-geo';

/** Circle fallback when real district GeoJSON is missing for a neighborhood. */
export function buildNeighborhoodFallbackCollection(
  neighborhoods: PublicNeighborhood[],
  cityPcode: string,
  cacheKey: string,
) {
  const items = neighborhoods
    .filter((n) => n.latitude != null && n.longitude != null)
    .map((neighborhood) => ({
      center: { lat: neighborhood.latitude!, lng: neighborhood.longitude! },
      radiusKm: NEIGHBORHOOD_BOUNDARY_RADIUS_KM,
      properties: {
        id: neighborhood.id,
        name: neighborhood.name,
        pcode: neighborhood.neighb_pcode,
        kind: 'neighborhood' as MapBoundaryKind,
        cityPcode,
      },
    }));

  return buildBoundaryCollection(items, cacheKey);
}

export function buildCityFallbackCollection(cities: PublicCity[]) {
  const items = cities
    .filter((city) => city.latitude != null && city.longitude != null)
    .map((city) => ({
      center: { lat: city.latitude!, lng: city.longitude! },
      radiusKm: CITY_BOUNDARY_RADIUS_KM,
      properties: {
        id: city.id,
        name: city.name,
        pcode: city.pcode,
        kind: 'city' as MapBoundaryKind,
      },
    }));

  return buildBoundaryCollection(items, 'cities:fallback');
}
